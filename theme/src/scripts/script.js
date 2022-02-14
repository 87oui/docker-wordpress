'use strict';

// ライブラリ
import 'lazysizes';
import SweetScroll from 'sweet-scroll';
import WebFont from 'webfontloader';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const body = document.body;

    // スムーススクロール
    new SweetScroll();

    // ウェブフォント読み込み
    WebFont.load({
      google: {
        families: [
          'Noto+Sans+JP:400,500,700?display=swap',
          'Prompt:600,700?display=swap',
        ],
      },
      active: function () {
        sessionStorage.fonts = true;
        sessionStorage.fontsLoaded = true;
      },
    });

    // グローバルナビゲーション開閉
    const gnavToggle = document.getElementById('gnav-toggle');
    if (gnavToggle) {
      gnavToggle.addEventListener('click', () => {
        body.setAttribute(
          'data-gnav-show',
          !(body.getAttribute('data-gnav-show') === 'true')
        );
      });

      // ページ内リンクをクリックしたらナビゲーションを閉じる
      const gnavItems = document.querySelectorAll('.gnav [data-scroll]');
      gnavItems.forEach((item) => {
        item.addEventListener('click', () => {
          body.setAttribute('data-gnav-show', false);
        });
      });
    }
  },
  false
);
