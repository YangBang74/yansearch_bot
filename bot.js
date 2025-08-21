import TelegramBot from 'node-telegram-bot-api'
import axios from 'axios'
import 'dotenv/config'

const TOKEN = process.env.API_TOKEN
const bot = new TelegramBot(TOKEN, { polling: true })

console.log('Бот запущен и готов к работе!')

// Обработчик сообщений
bot.on('inline_query', async (inlineQuery) => {
  const query = inlineQuery.query.trim()
  if (!query) return

  try {
    // Поиск в Википедии (русская)
    const url = `https://ru.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    const res = await axios.get(url)
    const data = res.data

    if (!data.extract) return

    // Берём первые 2 абзаца
    const snippet = data.extract.split('\n').slice(0, 2).join('\n\n')

    const results = [
      {
        type: 'article',
        id: data.pageid.toString(),
        title: data.title,
        input_message_content: {
          message_text: snippet,
        },
        description: snippet.slice(0, 100) + '...',
      },
    ]

    bot.answerInlineQuery(inlineQuery.id, results, { cache_time: 0 })
  } catch (err) {
    console.error(err.message)
  }
})
