import AuditLog from "../models/AuditLog.js";

export async function audit({ actorId, role, action, entity, entityId, meta = {} }) {
  await AuditLog.create({
    actorId,
    role,
    action,
    entity,
    entityId,
    meta,
    timestamp: new Date(),
  });
}

export function emitEvent(name, payload) {
  console.log(`[event] ${name}`, JSON.stringify({ ...payload, at: new Date().toISOString() }));
}
