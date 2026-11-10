/**
 * Toàn bộ nội dung cá nhân nằm ở đây.
 * Mục nào Long chưa điền thì để TODO_LONG — KHÔNG tự viết thay.
 */
export const TODO_LONG = '__TODO_LONG__' as const
export type Maybe<T = string> = T | typeof TODO_LONG

/** Text for display: TODO is visible in dev only, hidden (empty) in production build. */
export function show(v: Maybe): string {
  if (v !== TODO_LONG) return v
  return import.meta.env.DEV ? '[ĐIỀN]' : ''
}

export const HER_NAME = 'Khánh Hạ'

/** SHA-256 of the access password (plain text is never stored in code). */
export const PASSWORD_HASH = 'd516a567d213abaeb7b8550a7f5d3e4d07b58693e187ddd9442d4886e0042a82'

export const content = {
  door: {
    line1: 'Ở một nơi nào đó trên thế giới, một chút phép màu Giáng sinh đang đợi em...',
    line2: `${HER_NAME} ơi, em đã sẵn sàng chưa?`,
    button: 'MỞ CÁNH CỬA',
  },
  gate: {
    title: 'Một bí mật nhỏ',
    hint: 'Thì thầm mật khẩu để bước vào',
    wrong: 'Chưa đúng rồi, thử lại nhé?',
  },
  letter: TODO_LONG as Maybe,
  cocoa: TODO_LONG as Maybe,
  cookie: TODO_LONG as Maybe,
  ornaments: [] as Maybe[],
  globeSecret: TODO_LONG as Maybe,
  reindeer: [] as Maybe[],
  santaMail: [] as Maybe[],
  gifts: [
    { id: 1, title: 'Quà Giáng sinh', unlockAt: '2026-12-24T00:00:00+07:00', body: TODO_LONG as Maybe },
    { id: 2, title: 'Quà Năm mới', unlockAt: '2027-01-01T00:00:00+07:00', body: TODO_LONG as Maybe },
    { id: 3, title: 'Ngày 7 tháng 1', unlockAt: '2027-01-07T00:00:00+07:00', body: TODO_LONG as Maybe },
    { id: 4, title: 'Ngày 8 tháng 1', unlockAt: '2027-01-08T00:00:00+07:00', body: TODO_LONG as Maybe },
  ],
  playlist: [
    { title: "It's Beginning to Look a Lot Like Christmas", artist: 'Perry Como', youtube: TODO_LONG as Maybe },
    { title: 'Let It Snow! Let It Snow! Let It Snow!', artist: 'Dean Martin', youtube: TODO_LONG as Maybe },
    { title: 'The Christmas Song', artist: 'Nat King Cole', youtube: TODO_LONG as Maybe },
    { title: 'Last Christmas', artist: 'Wham!', youtube: TODO_LONG as Maybe },
    { title: 'White Christmas', artist: 'Bing Crosby', youtube: TODO_LONG as Maybe },
  ],
}

export const ui = { enter: 'Vào', skip: 'Bỏ qua ›' }
