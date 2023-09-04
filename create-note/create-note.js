#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Create Note
// @raycast.mode compact

// Optional parameters:
// @raycast.icon 🗒
// @raycast.needsConfirmation true
// @raycast.argument1 { "type": "text", "placeholder": "タイトル" }

// Documentation:
// @raycast.description Confluence開いて新規作成
// @raycast.author akgw
// @raycast.authorURL https://raycast.com/akgw

import open from 'open';
import dotenv from 'dotenv'

dotenv.config()

const domain = process.env.DOMAIN
const spaceKey = process.env.SPACEKEY
const title = process.argv.slice(2)[0]

console.log('新規作成ページへ遷移します')
await open(`https://${domain}/wiki/create-content/page?spaceKey=~${spaceKey}&source=spaceLevelContextualCreate-page&title=${title}`)
