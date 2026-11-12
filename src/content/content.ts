/** Nội dung cá nhân. Các cảnh sau sẽ được thêm lại từng cảnh một. */
export const HER_NAME = 'Khánh Hạ'

/** SHA-256 của mật khẩu (không lưu mật khẩu dạng chữ). */
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
}

/** 4 món quà dưới cây thông. Giờ mở khóa theo giờ Việt Nam (+07:00). `body` để trống đến khi Long điền nội dung thật. */
export const gifts: { id: number; title: string; unlockAt: string; body: string }[] = [
  { id: 1, title: 'Quà Giáng sinh', unlockAt: '2026-12-24T00:00:00+07:00', body: '' },
  { id: 2, title: 'Quà Năm mới', unlockAt: '2027-01-01T00:00:00+07:00', body: '' },
  { id: 3, title: 'Ngày 7 tháng 1', unlockAt: '2027-01-07T00:00:00+07:00', body: '' },
  { id: 4, title: 'Ngày 8 tháng 1', unlockAt: '2027-01-08T00:00:00+07:00', body: '' },
]

/** Chữ minh hoạ ở góc cảnh cây thông (sẽ đổi khi Long chốt nội dung). */
export const tree = {
  eyebrow: 'Dưới gốc cây',
  title: 'Bốn món quà cho em',
  body: 'Mỗi món quà sẽ mở vào một ngày riêng. Em chạm vào hộp quà để xem.',
}

export const treeText = {
  locked: 'Món quà này còn đang ngủ, chưa đến giờ mở đâu em.',
  waiting: 'Còn',
  empty: 'Món quà này đang được gói thêm một chút nữa...',
  close: 'Đóng',
}

export const ui = { enter: 'Vào', skip: 'Bỏ qua ›' }
