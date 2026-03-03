import { prisma } from '@/lib/prisma';

export async function updateStudentScores(studentId: number): Promise<void> {
  const analyses = await prisma.articleAnalysis.findMany({
    where: { article: { studentId } },
    select: {
      agencyScore: true,
      orthogonalThinkingScore: true,
      curiosityScore: true,
    },
  });

  if (analyses.length === 0) return;

  const avg = (values: number[]) =>
    values.reduce((sum, v) => sum + v, 0) / values.length;

  await prisma.student.update({
    where: { id: studentId },
    data: {
      avgAgency: avg(analyses.map((a) => a.agencyScore)),
      avgOrthogonalThinking: avg(analyses.map((a) => a.orthogonalThinkingScore)),
      avgCuriosity: avg(analyses.map((a) => a.curiosityScore)),
      articleCount: analyses.length,
    },
  });
}
