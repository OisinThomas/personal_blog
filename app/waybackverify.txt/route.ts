export async function GET() {
  return new Response(
    'Site owner contact: oisin.thomas.morrin@gmail.com\n',
    { headers: { 'Content-Type': 'text/plain' } }
  )
}
