/**
 * ДУУТАА-MN — Дууны сан
 * ---------------------
 * Дуу нэмэхдээ:
 *   1. YouTube дээрх дууны линкийг нээгээд ?v= -ийн ард орсон 11 тэмдэгтийг хуулна.
 *      Жишээ: https://www.youtube.com/watch?v=jM8dCGIm6yc  ->  youtubeId: "jM8dCGIm6yc"
 *   2. Дууг сонсоод хамгийн танигдахуйц хэсэг (эхлэл, хос эсвэл сэдэвлэсэн ая) хэдэн
 *      секундээс эхэлдгийг тодорхойлж, "start" талбарт бичнэ (секундээр).
 *   3. answers массивт нэр, зохиолч/хамтлагийн нэрийг бүх бичих хувилбараар (латинаар,
 *      товчлол гэх мэт) оруулбал таамаглал илүү зөв танигдана.
 *
 * ЗӨВХӨН МОНГОЛ ЗОХИОЛЫН ДУУГ энд нэмнэүү — cover, гадаад дууг оруулахгүй.
 */

const SONGS = [
  {
    id: "the_hu_wolf_totem",
    title: "Chono Süld (Wolf Totem)",
    artist: "The HU",
    youtubeId: "jM8dCGIm6yc",
    start: 75, // морин хуур + хоолойн дуулал орж ирэх мөч — өөрчилж болно
    answers: ["chono suld", "wolf totem", "the hu", "чоно сүлд"]
  },

  // --- Доорхыг жинхэнэ YouTube ID-аар солиод идэвхжүүлнэ үү (одоогоор ID хоосон тул тоглоомд орохгүй) ---
  {
    id: "the_hu_yuve_yuve_yu",
    title: "Yuve Yuve Yu",
    artist: "The HU",
    youtubeId: "v4xZUr0BEfE",
    start: 61,
    answers: ["yuve", "the hu"]
  },
];

// Зөвхөн бөглөгдсөн (youtubeId-тэй) дуунуудыг тоглоомд ашиглана
const ACTIVE_SONGS = SONGS.filter(s => s.youtubeId && s.title);
