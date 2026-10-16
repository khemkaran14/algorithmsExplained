import { api, json, readJson, requireSameOrigin, ApiError } from '@/lib/http';
import { requireUser } from '@/lib/user';
import { localSchema, EMPTY } from '@/learning/progress';
import { getLearning, mergeLearning } from '@/learning/server';
export async function GET() {
  return api(async () => {
    const user = await requireUser();
    return json(await getLearning(user.id));
  });
}
export async function POST(request: Request) {
  return api(async () => {
    requireSameOrigin(request);
    const user = await requireUser();
    const data = localSchema.parse(await readJson(request, 2097152));
    if (
      Object.keys(data.progress).length > 500 ||
      Object.keys(data.library).length > 500
    )
      throw new ApiError(400, 'Too many progress entries.');
    return json(
      await mergeLearning(
        user.id,
        data.owner && data.owner !== user.id ? EMPTY : data,
      ),
    );
  });
}
