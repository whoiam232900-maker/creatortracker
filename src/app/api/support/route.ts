import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, category, message } = body;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl === 'your_discord_webhook_url_here') {
      console.error('[SECURITY] DISCORD_WEBHOOK_URL is not configured in environment variables.');
      return NextResponse.json(
        { error: 'Support service is temporarily unavailable.' }, 
        { status: 503 }
      );
    }

    // Category colors
    const colors: Record<string, number> = {
      'Bug Report': 15158332, // Red
      'Feature Request': 3066993, // Green
      'Performance Issue': 15105570, // Orange
      'Account Help': 3447003, // Blue
      'General Feedback': 10181046, // Purple
    };

    const discordPayload = {
      embeds: [
        {
          title: `New Support Submission: ${category}`,
          color: colors[category] || 38690,
          fields: [
            { name: 'Name', value: name || 'Anonymous', inline: true },
            { name: 'Email', value: email || 'Not provided', inline: true },
            { name: 'Category', value: category, inline: false },
            { name: 'Message', value: message },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'CreatorTracker Support System',
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Discord API error:', errorData);
      return NextResponse.json({ error: 'Failed to send message to Discord' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
