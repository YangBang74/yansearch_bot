import TelegramBot from 'node-telegram-bot-api'
import axios from 'axios'
import 'dotenv/config'
import express from 'express'

const TOKEN = process.env.API_TOKEN
if (!TOKEN) {
  console.error("❌ Нет API_TOKEN, добавь в переменные окружения!")
  process.exit(1)
}

// Запускаем Telegram-бота
const bot = new TelegramBot(TOKEN, { polling: true })
console.log('🤖 Бот запущен и готов к работе!')

// Inline-поиск по Википедии
bot.on('inline_query', async (inlineQuery) => {
  const query = inlineQuery.query.trim()
  if (!query) return

  try {
    const url = `https://ru.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    const res = await axios.get(url)
    const data = res.data

    if (!data.extract) return

    const snippet = data.extract.split('\n').slice(0, 2).join('\n\n')

    const results = [
      {
        type: 'article',
        id: String(Date.now()),
        title: data.title,
        input_message_content: { message_text: snippet },
        description: snippet.slice(0, 100) + '...',
      },
    ]

    bot.answerInlineQuery(inlineQuery.id, results, { cache_time: 0 })
  } catch (err) {
    console.error("Ошибка запроса:", err.message)
  }
})

// Express-сервер (Render требует порт!)
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('✅ Telegram бот работает на Render!')
})

app.listen(PORT, () => {
  console.log(`🌐 Web service запущен на порту ${PORT}`)
})

setInterval(() => {
  console.log('⏰ Сервер работает, всё ок!')
}, 10_000)