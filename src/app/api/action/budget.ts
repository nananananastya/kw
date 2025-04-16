// app/actions/createBudget.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '~/server/db';
import { auth } from '~/server/auth'; // если используешь next-auth, это может быть getServerSession
import { z } from 'zod';

export async function createBudget(formData: FormData) {
  const session = await auth(); // получаем текущую сессию
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('Не удалось определить пользователя');
  }

  const parsed = z
    .object({
      name: z.string().min(1),
      amount: z.coerce.number().nonnegative(),
    })
    .parse({
      name: formData.get('name'),
      amount: formData.get('amount'),
    });

  const newBudget = await db.budget.create({
    data: {
      name: parsed.name,
      amount: parsed.amount,
      users: {
        create: {
          userId,
        },
      },
    },
  });

  revalidatePath('/budget');
  
  return {
    id: newBudget.id,
    name: newBudget.name,
  };
}
