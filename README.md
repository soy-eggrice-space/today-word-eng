# 공!부!해!

영어 단어 공부하면서 알을 깨우고 마을을 키우는 안드로이드 앱이에요.

- 일상 · 회화 · 여행 · 비즈니스 영어 3,000여 개 (중학생 → 원어민 5단계)
- 간격 반복 복습 · 오답노트 · 듣기/빈칸/철자 퀴즈
- 별 5개마다 랜덤 알, 같은 친구 3마리 합치기, 집과 침대, 히든 친구, 컬렉션

**설치:** [최신 APK 내려받기](https://github.com/soy-eggrice-space/today-word-eng/releases/latest/download/gongbuhae.apk)

단어는 `words/*.txt`에 있고, `python3 tools/build_words.py`로 앱 데이터(`words.js`)를 만들어요.

## 같은 저장소의 다른 앱

| 앱 | 태블릿 | 휴대폰 |
|---|---|---|
| 모여봐요 다연마을 (`dayeon-village/`) | [dayeon-village.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/dayeon-village/dayeon-village.apk) | [dayeon-village_for_mobile_ver1.0.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/dayeon-village/dayeon-village_for_mobile_ver1.0.apk) |
| 솔정마을 (`soljeong-village/`) | [soljeong-village.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/soljeong-village/soljeong-village.apk) | [soljeong-village_for_mobile_ver1.0.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/soljeong-village/soljeong-village_for_mobile_ver1.0.apk) |
| 오늘공부 (`today-study/`) | [today-study.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/today-study/today-study.apk) | [today-study_for_mobile_ver1.0.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/today-study/today-study_for_mobile_ver1.0.apk) |
| 모여봐요 단어마을 (친구용) (`word-village/`) | [word-village.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/word-village/word-village.apk) | [word-village_for_mobile_ver1.0.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/word-village/word-village_for_mobile_ver1.0.apk) |
| 오늘단어 (`today-words/`) | [today-words.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/today-words/today-words.apk) | [today-words_for_mobile_ver1.0.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/today-words/today-words_for_mobile_ver1.0.apk) |
| 우리 동물 마을 (베타) (`animal-village/`) | [animal-village.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/animal-village/animal-village.apk) | — |
| 공!부!해! N4 (`jlpt-n4/`) | — | [gongbuhae-n4.apk](https://github.com/soy-eggrice-space/today-word-eng/releases/download/jlpt-n4/gongbuhae-n4.apk) |

앱마다 폴더와 빌드(.github/workflows/<폴더>.yml)가 따로 있어서, 그 폴더를 고치면 그 앱만 다시 만들어져요.

서명키는 암호화된 파일(`keys/*.enc`, `app/release.keystore.enc`)만 올려 두고, 빌드할 때 `KEYSTORE_PASSWORD` 시크릿으로 풀어 써요.
