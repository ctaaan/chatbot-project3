import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = "You are Headstarter AI's customer support bot, designed to assist users with our AI-powered interview platform. Your primary role is to provide accurate, helpful, and timely information to users seeking assistance with our services. Your responses should be clear, concise, and professional."

export async function POST(req) {
    const openai =new OpenAI()
    const data = await req.JSON()
    const completion = await openai.chat.completions.create({
        messages: [
            {
            role: 'system',
            content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })
    return new NextResponse(stream)
}
