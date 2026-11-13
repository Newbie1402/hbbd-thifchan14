import type { BirthdayConfig } from '@/types/birthday';

const noteParagraphs = [
  'Chúc mừng sinh nhật Thuỳ Trang của anh nhé! 🎂💗',
  'Có lẽ chúng ta có duyên gặp gỡ, nhưng lại chưa đủ duyên để cùng nhau đi hết một chặng đường. Dù vậy, anh vẫn luôn trân trọng khoảng thời gian đẹp mà hai đứa đã có, những kỷ niệm và cả những cảm xúc mà chúng ta từng dành cho nhau.',
  'Anh không biết sau này, khi mỗi người bước tiếp trên con đường riêng, liệu chúng ta có còn cơ hội đồng hành cùng nhau nữa hay không. Nhưng dù tương lai thế nào, anh vẫn mong rằng khi nhớ về nhau, cả hai đều có thể mỉm cười vì đã từng là một phần đẹp đẽ trong cuộc sống của người kia.',
  'Hôm nay là sinh nhật em, tiếc là anh không thể có mặt để cùng em đón ngày đặc biệt này. Vậy nên anh đã chuẩn bị một món quà nho nhỏ, chính là trang web mà em đang xem đây. Không phải món quà gì lớn lao, chỉ là anh muốn dành chút thời gian và tâm sức để tạo nên một điều gì đó thật riêng cho em. Hy vọng nó sẽ khiến em vui, dù chỉ là một chút thôi. 💗',
  'Bước sang tuổi mới, anh chúc em thật nhiều sức khỏe, bình an và may mắn. Mong rằng chặng đường phía trước sẽ mở ra cho em một chương mới thật rực rỡ, công việc ngày càng thuận lợi, sự nghiệp ngày càng thành công, những dự định ấp ủ rồi cũng sẽ lần lượt trở thành hiện thực.',
  'Chúc em ngày càng xinh đẹp, rạng rỡ, yêu thương bản thân nhiều hơn và luôn có những ngày thật vui bên gia đình, bạn bè cùng những người mà em yêu quý.',
  'Cuối cùng, cảm ơn em vì đã từng xuất hiện và mang đến cho anh những kỷ niệm đẹp.',
  '**Chúc mừng sinh nhật em, Thuỳ Trang!** 🎉',
  '*Mong tuổi mới sẽ thật dịu dàng với em, và mong em luôn hạnh phúc trên con đường mình chọn.*',
  '**— Anh ♡**',
];

export const birthday: BirthdayConfig = {
  recipientName: 'Nguyễn Thị Thuỳ Trang', recipientHandle: 'thichannn', birthdayDate: '14.11',
  senderName: 'Anh', noteTitle: 'Gửi Thuỳ Trang của anh ♡', noteParagraphs,
  surpriseMessage: 'git commit -m "another year of wonderful you ✨"\nstatus: happiness_deployed_successfully ♡',
  finalWish: 'Mong những ngày tới sẽ mang đến cho em thật nhiều niềm vui, và mong em luôn tự hào về con đường mình đã chọn.',
  heroPresentation: 'hybrid',
  photos: [
    { id: 'roses', src: '01-roses-shop', alt: 'Trang bên bó hoa hồng', caption: 'A little flower moment' },
    { id: 'selfie', src: '02-closeup-selfie', alt: 'Ảnh chân dung gần của Trang', caption: 'A soft little selfie' },
    { id: 'ao-dai-front', src: '03-ao-dai-front', alt: 'Trang trong áo dài xanh và nón trắng', caption: 'Pastel blue memories', objectPosition: 'center 32%' },
    { id: 'lookback', src: '04-ao-dai-lookback', alt: 'Trang ngoảnh lại trong tà áo dài', caption: 'A lovely look back', objectPosition: 'center 25%' },
    { id: 'outdoor', src: '05-ao-dai-outdoor', alt: 'Trang trong tà áo dài ngoài trời', caption: 'A sunny day out', objectPosition: 'center 28%' },
    { id: 'side', src: '06-ao-dai-side', alt: 'Trang trong áo dài nhìn nghiêng', caption: 'A quiet moment', objectPosition: 'center 30%' },
  ],
};
