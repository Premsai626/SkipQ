import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { loginSchema, registerSchema } from '../validators/index.js';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const data = loginSchema.parse(req.body);
      const email = data.email.toLowerCase().trim();

      const isStaff = data.role === 'staff' || email.includes('desk') || email.includes('staff') || email.includes('operator');
      const defaultRole = isStaff ? 'staff' : 'student';
      const derivedName = isStaff
        ? 'Campus Desk Operator'
        : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const defaultId = isStaff ? 'usr_staff_1' : 'usr_student_1';

      let user = {
        id: defaultId,
        name: derivedName,
        email,
        role: defaultRole,
        department: isStaff ? 'Campus Stationery Desk' : 'Academic Dept',
        collegeId: isStaff ? 'STAFF-DESK' : '',
        phone: '',
      };

      // Check Supabase profiles table if available
      if (isSupabaseConfigured()) {
        try {
          const client = getSupabaseClient();
          if (client) {
            const { data: profile, error } = await client
              .from('profiles')
              .select('*')
              .eq('email', email)
              .maybeSingle();

            if (!error && profile) {
              user = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                department: profile.department || user.department,
                collegeId: profile.college_id || user.collegeId,
                phone: profile.phone || user.phone,
              };
            } else if (!profile) {
              // Ensure user exists in auth.users first to satisfy foreign key constraint
              let authUserId = null;
              try {
                const { data: listData } = await client.auth.admin.listUsers();
                const existingAuth = listData?.users?.find((u) => u.email?.toLowerCase() === email);
                if (existingAuth) {
                  authUserId = existingAuth.id;
                } else {
                  const { data: newAuth } = await client.auth.admin.createUser({
                    email,
                    password: data.password || 'password123',
                    email_confirm: true,
                    user_metadata: { name: derivedName, role: defaultRole },
                  });
                  if (newAuth?.user) {
                    authUserId = newAuth.user.id;
                  }
                }
              } catch (authErr) {
                console.warn('[AuthController] Auth user provision notice:', authErr.message);
              }

              if (authUserId) {
                user.id = authUserId;
              }

              // Upsert profile in Supabase
              await client.from('profiles').upsert([
                {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  department: user.department,
                  college_id: user.collegeId,
                  phone: user.phone,
                  updated_at: new Date().toISOString(),
                },
              ]);
            }
          }
        } catch (dbErr) {
          console.warn('[AuthController] Notice: Supabase profile lookup fallback:', dbErr.message);
        }
      }

      const token = jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

      res.json({
        success: true,
        data: {
          user,
          token,
        },
        message: 'Authentication successful',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      const email = data.email.toLowerCase().trim();

      let user = {
        id: `usr_${Date.now()}`,
        name: data.name,
        email,
        role: data.role || 'student',
        department: data.department || 'General Academic',
        collegeId: data.collegeId || 'STU-999',
        phone: data.phone || '+91 98765 00000',
      };

      // Save to Supabase profiles table if configured
      if (isSupabaseConfigured()) {
        try {
          const client = getSupabaseClient();
          if (client) {
            let authUserId = null;
            try {
              const { data: newAuth } = await client.auth.admin.createUser({
                email,
                password: data.password || 'password123',
                email_confirm: true,
                user_metadata: { name: data.name, role: data.role || 'student' },
              });
              if (newAuth?.user) {
                authUserId = newAuth.user.id;
              }
            } catch (authErr) {
              console.warn('[AuthController] Register auth user provision notice:', authErr.message);
            }

            if (authUserId) {
              user.id = authUserId;
            }

            const { error } = await client.from('profiles').upsert([
              {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                college_id: user.collegeId,
                phone: user.phone,
                updated_at: new Date().toISOString(),
              },
            ]);

            if (error) {
              console.warn('[AuthController] Failed to insert profile into Supabase:', error.message);
            }
          }
        } catch (dbErr) {
          console.warn('[AuthController] Supabase register notice:', dbErr.message);
        }
      }

      const token = jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

      res.status(201).json({
        success: true,
        data: {
          user,
          token,
        },
        message: 'Registration successful',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res) {
    let userData = req.user;

    // Check if fresh user profile exists in Supabase
    if (isSupabaseConfigured() && req.user?.id) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .maybeSingle();

          if (profile) {
            userData = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              department: profile.department,
              collegeId: profile.college_id,
              phone: profile.phone,
            };
          }
        }
      } catch (err) {
        // Fall back to token payload
      }
    }

    res.json({
      success: true,
      data: userData,
      timestamp: new Date().toISOString(),
    });
  }

  static async syncGoogleUser(req, res, next) {
    try {
      const { id, email, name, role, department, collegeId, phone } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required for Google authentication sync',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      let client = null;
      let existingProfile = null;

      if (isSupabaseConfigured()) {
        try {
          client = getSupabaseClient();
          if (client) {
            const { data } = await client
              .from('profiles')
              .select('*')
              .or(`id.eq.${id || 'none'},email.eq.${normalizedEmail}`)
              .maybeSingle();
            existingProfile = data;
          }
        } catch (dbErr) {
          console.warn('[AuthController] Notice: Supabase profile lookup:', dbErr.message);
        }
      }

      // Explicit role requested by user ('staff' or 'student')
      const explicitRole = role === 'staff' || role === 'student' ? role : null;
      const isEmailStaff = normalizedEmail.includes('desk') || normalizedEmail.includes('operator') || normalizedEmail.includes('staff');

      // Determine final role:
      // 1. Explicitly requested role (when user clicks Staff or Student portal/tab)
      // 2. Otherwise keep existing profile's stored role (protecting old users)
      // 3. Otherwise check email hints or default to 'student'
      let resolvedRole = explicitRole || existingProfile?.role || (isEmailStaff ? 'staff' : 'student');

      // Preserve all existing user details so old users never lose their data
      const resolvedName = existingProfile?.name || name || (resolvedRole === 'staff'
        ? 'Campus Desk Operator'
        : normalizedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()));

      const resolvedDept = existingProfile?.department || department || (resolvedRole === 'staff' ? 'Campus Stationery Desk' : 'Academic Dept');
      const resolvedCollegeId = existingProfile?.college_id || collegeId || (resolvedRole === 'staff' ? 'MLRIT-XEROX-01' : '');
      const resolvedPhone = existingProfile?.phone || phone || '';

      let user = {
        id: existingProfile?.id || id || `usr_${Date.now()}`,
        name: resolvedName,
        email: normalizedEmail,
        role: resolvedRole,
        department: resolvedDept,
        collegeId: resolvedCollegeId,
        phone: resolvedPhone,
      };

      if (client) {
        try {
          if (existingProfile) {
            // Update profile with role while preserving old user details
            const updateData = {
              name: resolvedName,
              role: resolvedRole,
              department: resolvedDept,
              college_id: resolvedCollegeId,
              phone: resolvedPhone,
              updated_at: new Date().toISOString(),
            };

            const { data: updatedProfile, error: updateErr } = await client
              .from('profiles')
              .update(updateData)
              .eq('id', existingProfile.id)
              .select()
              .maybeSingle();

            if (!updateErr && updatedProfile) {
              user = {
                id: updatedProfile.id,
                name: updatedProfile.name,
                email: updatedProfile.email,
                role: updatedProfile.role,
                department: updatedProfile.department || user.department,
                collegeId: updatedProfile.college_id || user.collegeId,
                phone: updatedProfile.phone || user.phone,
              };
            }
          } else {
            let authId = id && !id.startsWith('usr_') ? id : null;
            try {
              const { data: listData } = await client.auth.admin.listUsers();
              const matchedAuth = listData?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
              if (matchedAuth) {
                authId = matchedAuth.id;
              } else {
                const { data: newAuth } = await client.auth.admin.createUser({
                  email: normalizedEmail,
                  email_confirm: true,
                  user_metadata: { name: user.name, role: user.role },
                });
                if (newAuth?.user) {
                  authId = newAuth.user.id;
                }
              }
            } catch (e) {
              console.warn('[AuthController] Auth user provision notice:', e.message);
            }

            if (authId) {
              user.id = authId;
            }

            // Insert new profile
            const insertData = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              department: user.department,
              college_id: user.collegeId,
              phone: user.phone,
              updated_at: new Date().toISOString(),
            };

            const { data: newProfile, error: insertErr } = await client
              .from('profiles')
              .insert([insertData])
              .select()
              .maybeSingle();

            if (!insertErr && newProfile) {
              user = {
                id: newProfile.id,
                name: newProfile.name,
                email: newProfile.email,
                role: newProfile.role,
                department: newProfile.department || user.department,
                collegeId: newProfile.college_id || user.collegeId,
                phone: newProfile.phone || user.phone,
              };
            } else if (insertErr) {
              console.warn('[AuthController] Google profile insert notice:', insertErr.message);
            }
          }
        } catch (dbErr) {
          console.warn('[AuthController] Notice: Supabase Google sync error:', dbErr.message);
        }
      }

      const token = jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

      return res.json({
        success: true,
        data: {
          user,
          token,
        },
        message: `${user.role === 'staff' ? 'Staff' : 'Student'} authentication successful`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
