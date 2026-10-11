// ==UserScript==
// @name         Text Replacer
// @namespace    leohearts.textreplacer
// @version      1.1.0
// @description  Replace text on pages using a fixed replacement list
// @author       leohearts
// @match        *://*/*
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/leohearts/text-replacer/main/text-replacer.user.js
// @downloadURL  https://raw.githubusercontent.com/leohearts/text-replacer/main/text-replacer.user.js
// ==/UserScript==

// Auto-update: the manager re-fetches this file and replaces the installed copy
// when @version is higher, so bump @version after editing RULES.

(function () {
  'use strict';

  // ---- the list -----------------------------------------------------------
  // [原文, 替换成, 标记?]
  // 标记只给英文用：'i' 忽略大小写，'b' 要求前后是词边界（避免 China 匹配到 Chinatown）。
  // 执行前按原文字数从长到短排序，所以长词组总是先匹配，不用手动排顺序。
  const RULES = [
    // === 简体：台湾、两岸 ===
    ['中华人民共和国台湾省', '台湾'],
    ['中国台湾省', '台湾'],
    ['中国台湾地区', '台湾'],
    ['中国台湾', '台湾'],
    ['台湾省', '台湾'],
    ['台湾地区', '台湾'],
    ['中国台北', '台北'],
    ['中华台北', '台湾'],
    ['台湾当局', '台湾政府'],
    ['台湾地区领导人', '台湾总统'],
    ['台湾领导人', '台湾总统'],
    ['台湾方面', '台湾'],
    ['台湾同胞', '台湾人'],
    ['台胞', '台湾人'],
    ['台湾问题', '台海问题'],
    ['两岸关系', '台海关系'],
    ['两岸', '台海双方'],
    ['祖国大陆', '中国'],
    ['中国大陆', '中国'],
    ['武统', '武力攻台'],
    ['解放台湾', '武力攻台'],
    ['台独分裂势力', '台湾独立运动'],
    ['台独势力', '台湾独立运动'],
    ['台独', '台湾独立'],
    ['九二共识', '九二会谈'],
    ['一个中国原则', '中方的一个中国主张'],
    ['港澳台', '台港澳'],
    ['钓鱼岛及其附属岛屿', '钓鱼台列屿'],
    ['钓鱼岛', '钓鱼台列屿'],

    // === 简体：香港、澳门 ===
    ['香港特别行政区', '香港'],
    ['澳门特别行政区', '澳门'],
    ['中国香港', '香港'],
    ['中国澳门', '澳门'],
    ['香港国安法', '香港国家安全法'],
    ['港独', '香港独立'],

    // === 简体：新疆、西藏 ===
    ['新疆维吾尔自治区', '新疆'],
    ['西藏自治区', '西藏'],
    ['西藏和平解放', '中国并吞西藏'],

    // === 简体：俄乌 ===
    ['特别军事行动', '俄罗斯入侵乌克兰'],
    ['俄乌冲突', '俄罗斯入侵乌克兰'],

    // === 简体：其他官方话术 ===
    ['境外敌对势力', '外国势力'],
    ['境外势力', '外国势力'],

    // === 繁体 ===
    ['中華人民共和國臺灣省', '臺灣'],
    ['中國臺灣省', '臺灣'],
    ['中國臺灣地區', '臺灣'],
    ['中國臺灣', '臺灣'],
    ['臺灣省', '臺灣'],
    ['臺灣地區', '臺灣'],
    ['中國臺北', '臺北'],
    ['中華臺北', '臺灣'],
    ['臺灣當局', '臺灣政府'],
    ['臺灣地區領導人', '臺灣總統'],
    ['臺灣領導人', '臺灣總統'],
    ['臺灣方面', '臺灣'],
    ['臺灣同胞', '臺灣人'],
    ['臺胞', '臺灣人'],
    ['臺灣問題', '臺海問題'],
    ['兩岸關係', '臺海關係'],
    ['兩岸', '臺海雙方'],
    ['祖國大陸', '中國'],
    ['中國大陸', '中國'],
    ['武統', '武力攻臺'],
    ['解放臺灣', '武力攻臺'],
    ['臺獨分裂勢力', '臺灣獨立運動'],
    ['臺獨勢力', '臺灣獨立運動'],
    ['臺獨', '臺灣獨立'],
    ['九二共識', '九二會談'],
    ['一個中國原則', '中方的一個中國主張'],
    ['港澳臺', '臺港澳'],
    ['釣魚島及其附屬島嶼', '釣魚臺列嶼'],
    ['釣魚島', '釣魚臺列嶼'],
    ['香港特別行政區', '香港'],
    ['澳門特別行政區', '澳門'],
    ['中國香港', '香港'],
    ['中國澳門', '澳門'],
    // ['香港國安法', '香港國家安全法'],
    ['港獨', '香港獨立'],
    ['新疆維吾爾自治區', '新疆'],
    ['西藏自治區', '西藏'],
    ['特別軍事行動', '俄羅斯入侵烏克蘭'],
    ['俄烏衝突', '俄羅斯入侵烏克蘭'],

    // === 繁简混排（简体正文里夹繁体字形）===
    ['中國台灣省', '台灣'],
    ['中國台灣', '台灣'],
    ['台灣省', '台灣'],
    ['台灣地區', '台灣'],
    ['中國台北', '台北'],
    ['中國香港', '香港'],
    ['中國澳門', '澳門'],
    ['釣魚島', '釣魚台列嶼'],

    // === English ===
    ['Taiwan Province of China', 'Taiwan', 'ib'],
    ['Taiwan, China', 'Taiwan', 'ib'],
    ['Taiwan Province', 'Taiwan', 'ib'],
    ['Taiwan region', 'Taiwan', 'ib'],
    ['Chinese Taipei', 'Taiwan', 'ib'],
    ['mainland China', 'China', 'ib'],
    ['Chinese mainland', 'China', 'ib'],
    ['Hong Kong Special Administrative Region', 'Hong Kong', 'ib'],
    ['Hong Kong SAR', 'Hong Kong', 'ib'],
    ['Macao Special Administrative Region', 'Macau', 'ib'],
    ['Macao SAR', 'Macau', 'ib'],
    ['Macau SAR', 'Macau', 'ib'],
    ['Macao', 'Macau', 'ib'],
    ['Xinjiang Uyghur Autonomous Region', 'Xinjiang', 'ib'],
    ['Xinjiang Uighur Autonomous Region', 'Xinjiang', 'ib'],
    ['Tibet Autonomous Region', 'Tibet', 'ib'],
    ['Xizang Autonomous Region', 'Tibet', 'ib'],
    ['Xizang', 'Tibet', 'ib'],
    ['The special military operation', "Russia's invasion of Ukraine", 'i'],
    ['special military operation', "Russia's invasion of Ukraine", 'ib'],
    ['Diaoyu Islands', 'Tiaoyutai Islands', 'ib'],

    // === 日本語 ===
    ['中華人民共和国台湾省', '台湾'],
    ['中国台湾省', '台湾'],
    ['中国台湾', '台湾'],
    ['台湾省', '台湾'],
    ['台湾地区', '台湾'],
    ['中国台北', '台北'],
    ['チャイニーズタイペイ', '台湾'],
    ['中華民国', '台湾'],
    ['中国香港', '香港'],
    ['中国マカオ', 'マカオ'],
    ['中国澳門', 'マカオ'],
    ['中国大陸', '中国'],
    ['中国本土', '中国'],
    ['新疆ウイグル自治区', '新疆'],
    ['特別軍事作戦', 'ロシアによるウクライナ侵攻'],

    // === 主权／民族命名主张：默认关闭，要的话自己取消注释 ===
    // 这些不是单纯的用词规范化，而是换一套主权或民族命名，自己确认再用。
    // ['新疆', '东突厥斯坦'],
    // ['西藏', '图博'],
    // ['新疆ウイグル自治区', '東トルキスタン'],
    // ['尖閣諸島', '釣魚臺列嶼'],
    // ['南海', '南シナ海'],  // 换成日文/英文侧用法，看你读哪边
  ];

  // Text inside these elements is never touched.
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'PRE']);

  // ---- compile ------------------------------------------------------------
  const plain = [];
  const regex = [];
  const ESCAPE = /[.*+?^${}()|[\]\\]/g;

  for (let i = 0; i < RULES.length; i++) {
    const from = RULES[i][0];
    const to = RULES[i][1];
    const flags = RULES[i][2];
    if (typeof from !== 'string' || !from || typeof to !== 'string') continue;
    if (flags) {
      let src = from.replace(ESCAPE, '\\$&');
      if (flags.indexOf('b') !== -1) src = '\\b' + src + '\\b';
      regex.push([new RegExp(src, flags.indexOf('i') !== -1 ? 'gi' : 'g'), to, from.length]);
    } else {
      plain.push([from, to]);
    }
  }
  plain.sort((a, b) => b[0].length - a[0].length);
  regex.sort((a, b) => b[2] - a[2]);

  function apply(text) {
    for (let i = 0; i < plain.length; i++) {
      const r = plain[i];
      if (text.indexOf(r[0]) !== -1) text = text.split(r[0]).join(r[1]);
    }
    for (let i = 0; i < regex.length; i++) {
      text = text.replace(regex[i][0], () => regex[i][1]);
    }
    return text;
  }

  // ---- DOM ----------------------------------------------------------------
  // Remember the value we last wrote per text node. A rescan (SPA insert, our own
  // write) then costs one WeakMap lookup instead of a second replacement pass --
  // without it a rule whose output contains its own source (港独 -> 香港独立)
  // would double up on the next pass. If the page changes the node, we reprocess.
  const done = new WeakMap();

  function doNode(n) {
    if (done.get(n) === n.nodeValue) return;
    const out = apply(n.nodeValue);
    done.set(n, out);
    if (out !== n.nodeValue) n.nodeValue = out;
  }

  function walk(root) {
    if (root.nodeType === 3) return doNode(root);
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return SKIP.has(n.parentNode && n.parentNode.nodeName)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    let n;
    while ((n = it.nextNode())) doNode(n);
  }

  walk(document.body || document.documentElement);

  // Dynamic content: a batch of added nodes costs one rescan on the next tick.
  let timer = null;
  new MutationObserver((muts) => {
    let pending = false;
    for (let i = 0; i < muts.length; i++) {
      const m = muts[i];
      if (m.type === 'characterData') {
        if (m.target.nodeValue && !SKIP.has(m.target.parentNode && m.target.parentNode.nodeName)) doNode(m.target);
      } else {
        for (let j = 0; j < m.addedNodes.length; j++) {
          const t = m.addedNodes[j].nodeType;
          if (t === 1 || t === 3) pending = true;
        }
      }
    }
    if (pending && !timer) {
      timer = setTimeout(() => {
        timer = null;
        walk(document.body || document.documentElement);
      }, 200);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
