import type { Context } from './types'
import { info } from './utils'
export * from './types'

const RFC_CAT_ID = 'DIC_kwDOHz3x484CQ_Jh'
const ALLOWED_REPO = ['vite/rfcs']

export async function runAction(context: Context) {
  const { octokit, event } = context

  if (!('pull_request' in event && event.action === 'opened'))
    return
  if (!ALLOWED_REPO.includes(event.repository.full_name))
    return

  info({ event })

  const { pull_request } = event

  const files_url = `${pull_request.url}/files`
  const diff = (await octokit.request(files_url)) as any
  const addedFiles = (diff.data as { status: string; filename: string }[]).filter(i => i.status === 'added')
  const rfcFile = addedFiles.find(i => i.filename.startsWith('rfcs/') && i.filename.endsWith('.md'))

  if (!rfcFile) {
    info('No RFC file found. Skipped.')
    return
  }

  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const repoUrl = pull_request.base.repo.html_url
  const discussionUrlRegex = new RegExp(`${escapeRegExp(`${repoUrl}/discussions/`)}\\d+`)
  const renderedUrl = `${pull_request.head.repo.html_url}/blob/${pull_request.head.ref}/${rfcFile.filename}`
  let discussionUrl

  info(`RFC file found ${renderedUrl}`)

  const existingDiscussion = pull_request.body?.match(discussionUrlRegex)
  if (existingDiscussion?.[0]) {
    discussionUrl = existingDiscussion?.[0]
    info(`Existing Discussion found ${discussionUrl}`)
  }
  else {
    const discussionBody = [
      `This is an [RFC](https://github.com/vitejs/rfcs) proposed by @${pull_request.user.login}. To participate in the process, please read thoroughly about the proposal and then provide feedback or join the discussions below.`,
      '',
      `- [📖 Full Rendered Proposal](${renderedUrl})`,
      '',
      `- 🧑‍💻 Pull Request ${pull_request.html_url}`,
    ].join('\\n')
    const query = `
mutation {
  createDiscussion(input: { repositoryId: "${pull_request.base.repo.node_id}", categoryId: "${RFC_CAT_ID}", body: "${discussionBody}", title: "${pull_request.title}"}) {
    discussion {
      url
    }
  }
}`
    const result = (await octokit.graphql(query)) as any
    discussionUrl = result.createDiscussion.discussion.url
    info(`Discussion created ${discussionUrl}`)
  }

  await octokit.rest.issues.createComment({
    issue_number: event.pull_request.number,
    owner: event.repository.owner.login,
    repo: event.repository.name,
    body: [
      'This is an [RFC](https://github.com/vitejs/rfcs) pull request. To participate in the process, please read thoroughly about the proposal and provide feedback in the discussion thread with the link below.',
      '',
      `[📖 Full Rendered Proposal](${renderedUrl})`,
      '',
      `[💬 Discussion Thread](${discussionUrl})`,
      '<br>',
      '',
      '> **Note**',
      '> **Do NOT comment on this PR. Please use the discussion thread linked above to provide feedback, as it provides branched discussions that are easier to follow. This also makes the edit history of the PR clearer.**',
    ].join('\n'),
  })
}
