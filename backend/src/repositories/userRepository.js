import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

export class UserRepository {
  constructor() {
    // In-memory store for local development, caching & tests
    this.users = new Map();
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password, hash, email) {
    if (!password) return false;

    // 1. Try local/in-memory bcrypt hash comparison
    if (hash) {
      try {
        const matches = await bcrypt.compare(password, hash);
        if (matches) return true;
      } catch (err) {
        // Continue to fallback
      }
    }

    // 2. Try Supabase Auth password verification if configured
    if (isSupabaseConfigured() && email) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password,
          });
          if (!error && data?.user) {
            return true;
          }
        }
      } catch (authErr) {
        // Fallback
      }
    }

    return false;
  }

  async findByEmail(email) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();

    // 1. Check in-memory store
    let inMemoryUser = null;
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalized) {
        inMemoryUser = { ...u };
        break;
      }
    }

    // 2. Check Supabase profiles if configured
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('email', normalized)
            .maybeSingle();

          if (!error && data) {
            const merged = {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role || inMemoryUser?.role || 'student',
              status: data.status || inMemoryUser?.status || 'active',
              department: data.department || inMemoryUser?.department || '',
              collegeId: data.college_id || inMemoryUser?.collegeId || '',
              phone: data.phone || inMemoryUser?.phone || '',
              institution: data.institution || inMemoryUser?.institution || 'Campus',
              yearOfStudy: data.year_of_study || inMemoryUser?.yearOfStudy || '',
              profilePhoto: data.profile_photo || inMemoryUser?.profilePhoto || '',
              passwordHash: inMemoryUser?.passwordHash || data.password_hash || null,
              createdAt: data.created_at || inMemoryUser?.createdAt,
              updatedAt: data.updated_at || inMemoryUser?.updatedAt,
            };
            this.users.set(merged.id, { ...merged });
            return merged;
          }
        }
      } catch (err) {
        console.warn('[UserRepository] Supabase profile lookup fallback:', err.message);
      }
    }

    return inMemoryUser;
  }

  async findById(id) {
    if (!id) return null;

    // 1. Check in-memory store
    const inMemoryUser = this.users.get(id) ? { ...this.users.get(id) } : null;

    // 2. Check Supabase profiles if configured
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', id)
            .maybeSingle();

          if (!error && data) {
            const merged = {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role || inMemoryUser?.role || 'student',
              status: data.status || inMemoryUser?.status || 'active',
              department: data.department || inMemoryUser?.department || '',
              collegeId: data.college_id || inMemoryUser?.collegeId || '',
              phone: data.phone || inMemoryUser?.phone || '',
              institution: data.institution || inMemoryUser?.institution || 'Campus',
              yearOfStudy: data.year_of_study || inMemoryUser?.yearOfStudy || '',
              profilePhoto: data.profile_photo || inMemoryUser?.profilePhoto || '',
              passwordHash: inMemoryUser?.passwordHash || data.password_hash || null,
              createdAt: data.created_at || inMemoryUser?.createdAt,
              updatedAt: data.updated_at || inMemoryUser?.updatedAt,
            };
            this.users.set(id, { ...merged });
            return merged;
          }
        }
      } catch (err) {
        console.warn('[UserRepository] Supabase findById fallback:', err.message);
      }
    }

    return inMemoryUser;
  }

  async create({
    id,
    name,
    email,
    password,
    passwordHash,
    role = 'student',
    status = 'active',
    department = '',
    collegeId = '',
    phone = '',
    institution = 'Campus',
    yearOfStudy = '',
    profilePhoto = '',
  }) {
    // Only student and staff allowed
    const validRole = role === 'staff' ? 'staff' : 'student';
    const normalizedEmail = email.toLowerCase().trim();
    let finalId = id || uuidv4();
    const finalHash = passwordHash || (password ? await this.hashPassword(password) : null);

    // Provision in Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          try {
            const { data: listData } = await client.auth.admin.listUsers();
            const existingAuth = listData?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
            if (existingAuth) {
              finalId = existingAuth.id;
            } else if (password) {
              const { data: newAuth } = await client.auth.admin.createUser({
                email: normalizedEmail,
                password: password,
                email_confirm: true,
                user_metadata: { name: name.trim(), role: validRole },
              });
              if (newAuth?.user) {
                finalId = newAuth.user.id;
              }
            }
          } catch (authErr) {
            console.warn('[UserRepository] Supabase auth provision notice:', authErr.message);
          }

          const basePayload = {
            id: finalId,
            name: name.trim(),
            email: normalizedEmail,
            role: validRole,
            department: department || '',
            college_id: collegeId || '',
            phone: phone || '',
            updated_at: new Date().toISOString(),
          };

          const fullPayload = {
            ...basePayload,
            status,
            password_hash: finalHash,
          };

          const { error: fullError } = await client.from('profiles').upsert([fullPayload]);
          if (fullError) {
            await client.from('profiles').upsert([basePayload]);
          }
        }
      } catch (err) {
        console.warn('[UserRepository] Supabase profile upsert notice:', err.message);
      }
    }

    const user = {
      id: finalId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: finalHash,
      role: validRole,
      status: status,
      department: department || '',
      collegeId: collegeId || '',
      phone: phone || '',
      institution: institution || 'Campus',
      yearOfStudy: yearOfStudy || '',
      profilePhoto: profilePhoto || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store authoritative record in-memory
    this.users.set(finalId, { ...user });

    return { ...user };
  }

  async update(id, fields) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...fields,
      updatedAt: new Date().toISOString(),
    };

    // Store in-memory
    this.users.set(id, { ...updated });

    // Update in Supabase
    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
        if (client) {
          const updatePayload = {
            updated_at: updated.updatedAt,
          };
          if (fields.name !== undefined) updatePayload.name = fields.name;
          if (fields.department !== undefined) updatePayload.department = fields.department;
          if (fields.collegeId !== undefined) updatePayload.college_id = fields.collegeId;
          if (fields.phone !== undefined) updatePayload.phone = fields.phone;

          const fullUpdate = {
            ...updatePayload,
            ...(fields.status !== undefined ? { status: fields.status } : {}),
            ...(fields.passwordHash !== undefined ? { password_hash: fields.passwordHash } : {}),
          };

          const { error } = await client.from('profiles').update(fullUpdate).eq('id', id);
          if (error) {
            await client.from('profiles').update(updatePayload).eq('id', id);
          }
        }
      } catch (err) {
        console.warn('[UserRepository] Supabase update notice:', err.message);
      }
    }

    return { ...updated };
  }
}

// Singleton repository
let userRepoInstance = null;

export function getUserRepository() {
  if (!userRepoInstance) {
    userRepoInstance = new UserRepository();
  }
  return userRepoInstance;
}
