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

const mk = (title: string, tip: string, meaning: string[]): Memo => ({ title, tip, meaning, story: 'Chuyện của hai đứa về điều này sẽ được viết ở đây.' })
const bowStories: Memo[] = [
  mk('Chiếc nơ nhung đỏ', 'Một nút thắt nhỏ giữ cả mùa đông lại.', ['Người xưa buộc ruy băng đỏ lên cành thông như buộc một lời chúc: thắt chặt vào, đừng để tuột mất. Màu đỏ là màu của hơi ấm giữa tiết trời lạnh.', 'Nút thắt nào cũng cần hai bàn tay, một người giữ và một người buộc.']),
  mk('Nơ trên cành cao', 'Cái nơ đứng giữa ánh đèn, như đang đợi ai nhìn thấy.', ['Trên cây thông, nơ thường được buộc ở chỗ dễ nhìn thấy nhất, giữa những chùm đèn, để mắt người nhìn dừng lại một nhịp.', 'Có những thứ đẹp chỉ vì ai đó đã bỏ công buộc nó cẩn thận.']),
  mk('Nơ nhung nghiêng', 'Cái nơ hơi lệch, nên nhìn vào thấy thân thương.', ['Nhung đỏ từng là thứ vải dành cho những dịp trọng đại. Người ta cắt một đoạn nhỏ làm nơ, vì nghĩ rằng điều tử tế nhất nên được gói bằng thứ đẹp nhất mình có.', 'Cái nơ không hoàn hảo vẫn là cái nơ do tay người buộc.']),
  mk('Nơ giữa tán thông', 'Chiếc nơ lớn nhất nằm giữa thân cây.', ['Giữa thân cây thường là chỗ đặt nơ to nhất, như trái tim của cả cây thông. Từ đó, những dải ruy băng buông xuống như những lời nhắn dài.', 'Khi nhìn từ xa, người ta nhớ cây thông nhờ những mảng đỏ này.']),
  mk('Nơ cạnh chùm đèn', 'Đèn sáng thêm khi có một mảng đỏ bên cạnh.', ['Ánh đèn vàng đặt cạnh nhung đỏ tạo nên màu hổ phách ấm áp mà ai cũng thấy quen thuộc của đêm Giáng sinh.', 'Hai thứ khác màu đứng cạnh nhau, vậy mà lại làm nhau đẹp hơn.']),
  mk('Nơ nhỏ ở cành thấp', 'Cành thấp, nơ nhỏ, nhưng không bị bỏ sót.', ['Những cành thấp nhất thường là chỗ trẻ con với tới được. Người lớn buộc nơ ở đó để chúng có một điều của riêng mình trên cây.', 'Chỗ khiêm tốn nhất cũng xứng đáng có một món trang trí.']),
  mk('Nơ gần ngọn', 'Nơ gần ngọn nhất, gần ngôi sao nhất.', ['Càng lên cao cây càng nhỏ, nơ cũng nhỏ dần, như một cầu thang đỏ dẫn lên ngôi sao.', 'Đi từng bậc một cũng là cách để lên tới đỉnh.']),
  mk('Nơ nhung cuối cây', 'Chiếc nơ cuối cùng người ta buộc vào cây thông.', ['Thường thì nơ được buộc sau cùng, khi cây đã đủ đèn, đủ chuông. Nó như dấu chấm khép lại một buổi tối trang trí cây cùng nhau.', 'Có những khoảnh khắc nhỏ như vậy mới là phần đáng nhớ.']),
]
const bellStories: Memo[] = [
  mk('Chiếc chuông nhỏ', 'Tiếng chuông báo rằng có ai đó đang đến.', ['Chuông treo trên cây thông có từ thời người ta tin tiếng chuông xua đi bóng tối và những điều chẳng lành của mùa đông.', 'Một chiếc chuông nhỏ thôi cũng đủ báo rằng: có ai đó đang đến gần.']),
  mk('Chuông đồng', 'Chiếc chuông đồng giữ lại ánh đèn quanh nó.', ['Chuông đồng bắt ánh đèn rất đẹp, nên người ta thích treo nó cạnh những chùm đèn nhỏ. Mỗi cái chuông như một ngọn đèn thứ hai.', 'Thứ gì mang ánh sáng, dù là phản chiếu, cũng đều làm đêm bớt tối.']),
  mk('Chuông trên cành thấp', 'Cành thấp rung nhẹ là chuông ngân khẽ.', ['Chuông được treo bằng sợi chỉ mảnh, chỉ cần gió thoảng qua cành là nó ngân khẽ. Người xưa gọi đó là tiếng chào của cây.', 'Có những âm thanh nhỏ đến mức chỉ khi yên lặng mới nghe thấy.']),
  mk('Chuông bên cửa sổ', 'Chiếc chuông nghe được cả tiếng tuyết.', ['Treo chuông gần cửa sổ là thói quen của nhiều gia đình: đêm đông gió lay, chuông khẽ reo, như có ai gõ cửa chào.', 'Ngoài kia tuyết rơi, trong này có tiếng chuông.']),
  mk('Chuông giữa tán thông', 'Một chiếc chuông giữa muôn ngàn chiếc lá.', ['Giữa những cành thông dày, chiếc chuông là điểm sáng bất ngờ nhất, như một lời thì thầm giữa khu rừng nhỏ.', 'Điều bất ngờ thường nằm ở những chỗ ta không để ý.']),
  mk('Chuông ngân', 'Âm thanh mà cả năm mới nghe được một lần.', ['Tiếng chuông Giáng sinh là thứ âm thanh người ta chỉ nghe vào một mùa trong năm, nên nó mang cả cảm giác chờ đợi.', 'Có những điều đáng chờ chính vì nó không đến thường xuyên.']),
  mk('Chuông nhỏ trên ngọn', 'Chuông gần ngọn nhất, nghe xa nhất.', ['Chuông treo càng cao thì tiếng ngân càng lan xa. Người ta tin tiếng chuông trên cao sẽ báo tin cho cả mùa đông biết rằng nhà này đã sẵn sàng đón Giáng sinh.', 'Tin vui nên được treo thật cao.']),
]
const place = (title: string, tip: string, meaning: string[]) => mk(title, tip, meaning)
const sceneStories: Record<string, Memo> = {
  window: place('Cửa sổ ngập tuyết', 'Ngoài kia lạnh, trong này có đèn.', ['Cửa sổ mùa đông là nơi người ta đứng nhìn tuyết rơi mà không thấy lạnh. Kính phủ hơi nước, ngoài trời xanh thẫm, trong phòng vàng ấm: hai thế giới chỉ cách nhau một lớp kính.', 'Chính vì ngoài kia lạnh nên căn phòng này mới ấm đến vậy.']),
  curtainL: place('Tấm rèm nhung', 'Tấm rèm nặng giữ lại hơi ấm của căn phòng.', ['Rèm nhung dày từng được treo để chặn gió lùa qua khe cửa. Kéo rèm lại là cách báo rằng: đêm nay không ai phải ra ngoài nữa.', 'Có những tấm vải sinh ra để giữ hơi ấm ở lại.']),
  curtainR: place('Rèm bên cửa sổ', 'Tấm rèm đỏ buông xuống đến tận sàn.', ['Màu đỏ sẫm của rèm hợp với màu của quả nhựa ruồi và nơ trên cây, nên cả căn phòng nhìn như được phối cùng một bảng màu.', 'Sự ấm áp đôi khi chỉ là những thứ cùng màu đứng gần nhau.']),
  painting: place('Bức tranh nhỏ', 'Bức tranh một vùng quê mà ai đó từng đi qua.', ['Người ta treo tranh phong cảnh trong nhà để mùa đông nào cũng có một khung cửa khác nhìn ra mùa hè. Mỗi lần ngẩng lên, lại nhớ ra rằng mùa lạnh rồi cũng qua.']),
  painting2: place('Bức tranh bên cửa sổ', 'Một góc làng quê dưới tuyết.', ['Những bức tranh làng quê trong tuyết thường được treo vào dịp cuối năm, vì ai cũng muốn nhớ về một nơi chốn yên bình, nơi đèn sáng ở mọi cửa sổ.']),
  shelf: place('Tủ sách gỗ', 'Những cuốn sách chờ được đọc to lên.', ['Mùa đông là mùa của sách: ngoài trời lạnh thì cứ ở trong nhà, đọc một chương trước khi ngủ. Tủ sách gỗ cũ có mùi giấy và mùi nến, mùi của những buổi tối chậm.', 'Có những cuốn sách chỉ mở ra vào đúng dịp này trong năm.']),
  basket: place('Giỏ củi', 'Giỏ củi khô cho những đêm dài.', ['Trước mùa đông, người ta chẻ củi và xếp đầy giỏ cạnh lò sưởi. Giỏ đầy củi là lời hứa rằng: dù đêm có dài đến mấy, lửa sẽ không tắt.', 'Chuẩn bị cho nhau từ trước là một kiểu thương thầm lặng.']),
  tools: place('Bộ dụng cụ lò sưởi', 'Cái cời lửa đứng đó, chờ người thêm một khúc củi.', ['Chiếc cời, cái xẻng, chổi nhỏ: bộ ba người ta dùng mỗi tối để giữ lửa. Cời lửa là việc nhỏ, nhưng làm đúng thì cả đêm ấm.', 'Người giữ lửa cũng là người giữ cả căn nhà.']),
  garland: place('Vòng lá trên bệ lò sưởi', 'Cành thông xanh, quả đỏ, đèn nhỏ.', ['Dây lá thông trang trí bệ lò sưởi vì cành thông xanh suốt mùa đông. Người ta chọn thêm quả đỏ và đèn nhỏ, để màu xanh có chỗ nương tựa.', 'Có những thứ nhỏ nhưng làm cả căn phòng có hơi thở mùa lễ.']),
  chair: place('Ghế bành và tấm chăn', 'Chỗ ngồi chờ hai người co chân lại.', ['Chiếc ghế bành bên cửa sổ và tấm chăn ca-rô là góc quen thuộc của những buổi tối đông: một tách trà, một cuốn sách, và một người ngồi cạnh.', 'Một chỗ ngồi ấm là món quà mùa đông đáng giá nhất.']),
  rug: place('Tấm thảm cổ', 'Tấm thảm ngồi dưới chân cây suốt bao mùa Giáng sinh.', ['Thảm dệt hoa văn là thứ người ta trải dưới gốc cây thông để đón những món quà đầu tiên. Mỗi vết sờn trên thảm là một mùa đông đã đi qua.', 'Đồ cũ thường giữ lại nhiều ký ức hơn đồ mới.']),
  tree: place('Cây thông', 'Cây thông là trái tim của căn phòng.', ['Từ xa xưa, người ta mang cây thông xanh vào nhà giữa mùa đông để nhắc nhau rằng sự sống vẫn tiếp tục. Trang trí bằng đèn, chuông, nơ và quà là cách cả nhà cùng nhau thắp sáng đêm dài.', 'Đứng trước cây thông, ai cũng như trẻ lại một chút.']),
}
export const getMemory = (id: string): Memo | undefined => {
  if (memories[id]) return memories[id]
  if (sceneStories[id]) return sceneStories[id]
  const n = Number(id.replace(/\D/g, ''))
  if (id.startsWith('bow')) return bowStories[n % bowStories.length]
  if (id.startsWith('bell')) return bellStories[n % bellStories.length]
}

/** Chữ ở góc cảnh cây thông (chữ tạm, sẽ đổi khi Long chốt nội dung). */
export const tree = {
  title: 'Cây thông',
  tagline: 'Giữa mùa đông, vẫn còn một góc xanh.',
  body: 'Người xưa mang cây thông vào nhà để nhắc nhau rằng bóng tối nào rồi cũng lùi lại. Mỗi chùm đèn là một điều ước chưa nói thành lời, ngôi sao trên đỉnh chỉ đường về nhà, còn dưới gốc cây là những điều bất ngờ dành cho người mình thương.',
  hint: 'Em chạm vào hộp quà, tất, vòng hoa, ngôi sao hay đèn để xem điều gì xảy ra.',
}

/** Chữ ở góc cảnh hai chú mèo. Thông tin hai bé lấy từ ảnh Long gửi; chuyện riêng sẽ thêm khi Long viết. */
export const cats = {
  title: 'Bông và Mochi',
  tagline: 'Hai bé được thương, hai đứa mình cũng vậy.',
  // [nháp] lời Long, chờ Long sửa lại
  body: [
    'Bông là bé của anh, Mochi là bé của em. Hai cô nàng được ôm, được nuông, được ngủ ở chỗ ấm nhất nhà, và chẳng bé nào phải hỏi vì sao.',
    'Anh thương Bông theo cách của anh, em thương Mochi theo cách của em. Mỗi đứa đều có một sinh linh bé nhỏ để chăm, để lo, để về nhà là có người chờ.',
    'Có lẽ vì vậy mà hai bé nằm cạnh nhau yên tâm đến thế: bé nào cũng được yêu, và hai đứa mình cũng thương nhau như thế.',
  ],
  hint: 'Em rê chuột vào từng bé, rồi bấm xem bé đổi dáng nhé.',
  bong: { title: 'Bông · bé của anh', tip: 'Cô nàng trắng pha xám, mắt hổ phách, được anh thương từng cái ôm, từng giấc ngủ. Bấm để bé đổi dáng.' },
  mochi: { title: 'Mochi · bé của em', tip: 'Cô nàng xám vằn, mắt xanh vàng, được em nuông chiều hết mực. Bấm để bé đổi dáng.' },
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
