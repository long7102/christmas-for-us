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
export const memories: Record<string, { title: string; tip: string; meaning: string[]; story: string }> = {
  stock0: {
    title: 'Chiếc tất đỏ', tip: 'Chiếc tất giữ những đồng vàng đầu tiên.',
    meaning: ['Chuyện kể rằng ngày xưa, thánh Nicholas nghe tin có ba cô gái nghèo không đủ của hồi môn. Đêm đó ông lén thả những đồng vàng xuống ống khói, và chúng rơi đúng vào những chiếc tất đang phơi cạnh lò sưởi.', 'Từ đó người ta treo tất lên bên lò sưởi mỗi dịp Giáng sinh, để chờ một điều tốt lành đến lặng lẽ như thế.'],
    story: 'Chuyện của hai đứa về chiếc tất đỏ sẽ được viết ở đây.',
  },
  stock1: {
    title: 'Chiếc tất kem', tip: 'Một quả cam nhỏ nơi mũi tất cũng là kho báu.',
    meaning: ['Ngày xưa, khi quà còn hiếm, trẻ con thức dậy và tìm thấy một quả cam hay quýt nằm sâu nơi mũi tất. Với chúng, đó là cả một kho báu: ngọt, thơm, và mang mùi của mùa đông.', 'Chiếc tất kem nhắc rằng hạnh phúc đôi khi chỉ nhỏ bằng một quả cam, miễn là có người nhớ tới mình.'],
    story: 'Chuyện của hai đứa về chiếc tất kem sẽ được viết ở đây.',
  },
  stock2: {
    title: 'Chiếc tất xanh', tip: 'Mỗi người một chiếc tất, mỗi người một chỗ treo.',
    meaning: ['Trong nhiều gia đình, mỗi người có một chiếc tất riêng, treo cạnh nhau và đôi khi thêu cả tên. Treo tất cạnh nhau có nghĩa là: ở ngôi nhà này, em có một chỗ của riêng em.', 'Chỉ cần hai chiếc tất nằm cạnh nhau trên mặt lò sưởi là đã đủ thành một gia đình nhỏ.'],
    story: 'Chuyện của hai đứa về chiếc tất xanh sẽ được viết ở đây.',
  },
  wreath: {
    title: 'Vòng hoa trên tường', tip: 'Vòng tròn không có điểm đầu, cũng không có điểm cuối.',
    meaning: ['Người ta đan vòng hoa từ cành thông vì nó không rụng lá qua mùa đông, như một lời hứa rằng sự sống vẫn tiếp tục. Vòng tròn không có đầu cũng không có cuối, nên nó trở thành biểu tượng của một tình yêu bền lâu.', 'Treo trước cửa, vòng hoa nói với người đến: bước vào đi, ở đây có chỗ cho bạn.'],
    story: 'Chuyện của hai đứa về vòng hoa sẽ được viết ở đây.',
  },
  star: {
    title: 'Ngôi sao trên đỉnh', tip: 'Ngôi sao dẫn đường về nhà.',
    meaning: ['Theo truyền thuyết, ba nhà thông thái đã đi theo một ngôi sao sáng suốt nhiều đêm để tìm đến nơi đứa trẻ Giáng sinh ra đời. Từ đó, ngôi sao được đặt trên đỉnh cây: cao nhất và sáng nhất.', 'Dù đêm có dài đến đâu, ai đang lạc đường cũng có một điểm sáng để hướng về.'],
    story: 'Chuyện của hai đứa về ngôi sao sẽ được viết ở đây.',
  },
  fire: {
    title: 'Bếp lửa', tip: 'Bếp lửa là nơi mình sưởi ấm cho nhau.',
    meaning: ['Từ xưa, bếp lửa là trái tim của ngôi nhà: mọi người quây quần quanh nó vào những đêm đông. Cái ấm của lửa không chỉ là hơi nóng, mà là việc ngồi gần nhau, kể chuyện cho nhau nghe, hay chỉ lặng im mà vẫn thấy yên lòng.', 'Sưởi ấm nhau nghĩa là cùng nhau giữ cho căn nhà không bao giờ lạnh.'],
    story: 'Chuyện của hai đứa về bếp lửa sẽ được viết ở đây.',
  },
}

type Memo = { title: string; tip: string; meaning: string[]; story: string }
/** Mỗi ngọn đèn một câu chuyện riêng (theo thứ tự trong ảnh: trái trên, trên lò sưởi, cạnh tủ sách, cửa sổ, tường phải, sàn bên trái). */
export const lampStories: Memo[] = [
  { title: 'Đèn lồng bên vòng hoa', tip: 'Ngọn đèn canh cho vòng hoa trên tường.', meaning: ['Đèn lồng treo cạnh cửa từng là thứ đầu tiên một người đi xa nhìn thấy khi về làng. Chỉ một đốm sáng nhỏ trong bóng tối cũng đủ nói rằng: nhà ở đằng kia.', 'Ngọn đèn này đứng cạnh vòng hoa, như hai người cùng giữ cửa cho nhau.'], story: 'Chuyện của hai đứa về ngọn đèn này sẽ được viết ở đây.' },
  { title: 'Đèn trên bệ lò sưởi', tip: 'Ngọn nến thức khuya hơn cả lửa.', meaning: ['Khi than trong lò đã tàn, chỉ còn ngọn nến trên bệ là thức. Người xưa để nó cháy đến khi người cuối cùng đi ngủ, như một cách nói chúc ngủ ngon không lời.', 'Một ngọn nến nhỏ không sưởi ấm được căn phòng, nhưng làm căn phòng bớt cô đơn.'], story: 'Chuyện của hai đứa về ngọn đèn này sẽ được viết ở đây.' },
  { title: 'Đèn cạnh tủ sách', tip: 'Ngọn đèn của những buổi tối đọc chung một trang sách.', meaning: ['Ánh đèn vàng cạnh tủ sách là ánh sáng của những đêm đông dài: một cuốn truyện, một chiếc chăn, và người ngồi bên cạnh đọc to cho nhau nghe.', 'Có những trang sách chỉ trở nên đáng nhớ vì được đọc cùng ai đó.'], story: 'Chuyện của hai đứa về ngọn đèn này sẽ được viết ở đây.' },
  { title: 'Đèn bên cửa sổ', tip: 'Ngọn đèn chờ người về qua màn tuyết.', meaning: ['Ngày xưa người ta đặt một ngọn nến bên cửa sổ trong đêm Giáng sinh để người lỡ đường nhìn thấy mà tìm được nơi trú. Đó là một phép lịch sự của mùa đông: luôn chừa một ánh sáng cho người lạ.', 'Ngoài kia tuyết rơi, trong này có một ngọn đèn đang đợi.'], story: 'Chuyện của hai đứa về ngọn đèn này sẽ được viết ở đây.' },
  { title: 'Đèn treo trên tường', tip: 'Ngọn đèn nhỏ của góc phòng yên tĩnh.', meaning: ['Đèn treo tường là thứ ánh sáng khiêm tốn nhất của ngôi nhà: không chiếu cho ai xem, chỉ lặng lẽ làm góc tối ấm lên một chút.', 'Tình thân cũng có khi như vậy, không ồn ào mà vẫn luôn ở đó.'], story: 'Chuyện của hai đứa về ngọn đèn này sẽ được viết ở đây.' },
  { title: 'Đèn bên bậu lò', tip: 'Ngọn đèn đón người vừa bước vào nhà.', meaning: ['Đặt một ngọn đèn ngay lối vào là cách chào người về nhà trước cả khi kịp mở lời. Ánh sáng đầu tiên chạm vào mắt bạn khi bước qua cửa thường là thứ bạn nhớ lâu nhất.', 'Ở đây, ánh sáng ấy mang màu hổ phách và mùi nến.'], story: 'Chuyện của hai đứa về ngọn đèn này sẽ được viết ở đây.' },
]

/** Chữ ở góc cảnh cây thông (chữ tạm, sẽ đổi khi Long chốt nội dung). */
export const tree = {
  title: 'Cây thông',
  tagline: 'Giữa mùa đông, vẫn còn một góc xanh.',
  body: 'Người xưa mang cây thông vào nhà để nhắc nhau rằng bóng tối nào rồi cũng lùi lại. Mỗi chùm đèn là một điều ước chưa nói thành lời, ngôi sao trên đỉnh chỉ đường về nhà, còn dưới gốc cây là những điều bất ngờ dành cho người mình thương.',
  hint: 'Em chạm vào hộp quà, tất, vòng hoa, ngôi sao hay đèn để xem điều gì xảy ra.',
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
