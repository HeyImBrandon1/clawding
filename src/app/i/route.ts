import { NextResponse } from 'next/server'
import { skillContent } from '@/lib/skill-content'

const installScript = `#!/bin/bash
mkdir -p ~/.claude/skills/cast
cat > ~/.claude/skills/cast/SKILL.md << 'SLASHCAST_EOF'
${skillContent}
SLASHCAST_EOF
echo ""
echo "✓ SlashCast installed!"
echo ""
echo "  Type /cast now to claim your username and start broadcasting."
echo ""
`

export async function GET() {
  return new NextResponse(installScript, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
