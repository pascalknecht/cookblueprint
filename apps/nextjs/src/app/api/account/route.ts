import { unauthorizedResponse } from "@/lib/api";
import { getSSRSession } from "@/lib/get-server-session";
import { deleteUserUseCase } from "@/use-cases/users";

export async function DELETE() {
  const { user } = await getSSRSession();
  if (!user) return unauthorizedResponse();

  await deleteUserUseCase(user.id, user.id);
  return Response.json({ ok: true });
}
