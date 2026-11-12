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

/** Email nhận lời nhắn từ Khánh Hạ (món quà 7/1). */
export const LONG_EMAIL = 'ngvietlong712002@gmail.com'

export type GiftKind = 'plain' | 'reply' | 'qr'
/** 4 món quà dưới cây thông. Giờ mở khóa theo giờ Việt Nam (+07:00). Chữ có `[nháp]` là bản nháp, Long sửa lại sau. */
export const gifts: { id: number; kind: GiftKind; title: string; stamp: string; unlockAt: string; body: string[]; extra?: string }[] = [
  { id: 1, kind: 'plain', title: 'Quà Noel', stamp: '25 · 12', unlockAt: '2026-12-25T00:00:00+07:00', body: [] },
  {
    id: 2, kind: 'reply', title: 'Sinh nhật anh', stamp: '07 · 01', unlockAt: '2027-01-07T00:00:00+07:00',
    body: [
      'Em à,',
      'Hôm nay là sinh nhật anh. Anh không cần điều ước nào cả, vì điều anh muốn nhất là có em ở đây, và anh đã có rồi.',
      'Cảm ơn em vì đã ở cạnh anh, vì những ngày bình thường mà em làm cho đáng nhớ. Anh mong mình còn được đi qua thật nhiều mùa đông như thế này.',
      'Bên dưới có một khoảng giấy trống. Em viết gì cho anh cũng được, anh sẽ đọc từng chữ một.',
      'Anh, Long',
    ],
  },
  {
    id: 3, kind: 'qr', title: 'Sinh nhật em', stamp: '08 · 01', unlockAt: '2027-01-08T00:00:00+07:00',
    body: [
      'Chúc mừng sinh nhật em, Khánh Hạ.',
      'Chúc em một tuổi mới thật nhẹ nhàng: ăn ngon, ngủ ngon, và luôn có những điều nhỏ bé làm em mỉm cười.',
      'Anh còn một món quà nữa dành cho em, ở mã QR bên dưới.',
    ],
    extra: 'Mã QR sẽ thêm sau',
  },
  { id: 4, kind: 'plain', title: 'Valentine', stamp: '14 · 02', unlockAt: '2027-02-14T00:00:00+07:00', body: [] },
]

/** Những vật trong phòng bấm được. Ảnh và câu chuyện thật Long sẽ cung cấp sau. */
export const memories: Record<string, { title: string; story: string }> = {
  stock0: { title: 'Chiếc tất đỏ', story: 'Câu chuyện nhỏ về chiếc tất này sẽ được kể ở đây.' },
  stock1: { title: 'Chiếc tất kem', story: 'Câu chuyện nhỏ về chiếc tất này sẽ được kể ở đây.' },
  stock2: { title: 'Chiếc tất xanh', story: 'Câu chuyện nhỏ về chiếc tất này sẽ được kể ở đây.' },
  wreath: { title: 'Vòng hoa trên tường', story: 'Câu chuyện nhỏ về vòng hoa này sẽ được kể ở đây.' },
}

/** Chữ ở góc cảnh cây thông (chữ tạm, sẽ đổi khi Long chốt nội dung). */
export const tree = {
  title: 'Cây thông',
  body: 'Bốn món quà, mỗi món mở vào một ngày riêng. Em chạm vào hộp quà, tất, vòng hoa, ngôi sao hay đèn để xem điều gì xảy ra.',
}

export const treeText = {
  locked: 'Món quà này còn đang ngủ, chưa đến giờ mở đâu em.',
  waiting: 'Còn',
  empty: 'Món quà này đang được gói thêm một chút nữa...',
  close: 'Đóng',
  photo: 'Ảnh của hai đứa sẽ ở đây',
  replyLabel: 'Em viết gì cho anh nhé',
  replyHolder: 'Viết vào đây...',
  send: 'Gửi cho anh',
  copy: 'Chép lời nhắn',
  copied: 'Đã chép',
  sendHint: 'Bấm "Gửi cho anh" sẽ mở ứng dụng email của em với lời nhắn đã điền sẵn.',
}

export const ui = { enter: 'Vào', skip: 'Bỏ qua ›' }
