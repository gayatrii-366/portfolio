import { NextResponse } from 'next/server';

export async function GET() {
  const resumeContent = "Gayatri Swami\nAI Developer\n\ngayatriswami73@gmail.com\n\nExperience:\n- AI Developer\n\nEducation:\n- MIT WPU\n";

  return new NextResponse(resumeContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="Gayatri_Swami_Resume.txt"',
    },
  });
}
