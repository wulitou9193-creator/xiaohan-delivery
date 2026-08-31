
// 词汇库搜索
var vsearch = document.getElementById('vsearch');
if (vsearch) {
  var tbody = document.querySelector('#vocab tbody');
  var rows = [];
  fetch('data/vocab.json').then(function(r){ return r.json(); }).then(function(data){
    rows = data;
    render(rows);
  });
  vsearch.addEventListener('input', function(){
    var q = vsearch.value.trim().toLowerCase();
    if (!q) { render(rows); return; }
    render(rows.filter(function(r){
      return (r.word||'').toLowerCase().indexOf(q) !== -1 ||
             (r.meaning_zh||'').indexOf(q) !== -1;
    }));
  });
  function render(list) {
    tbody.innerHTML = list.slice(0, 2000).map(function(r){
      return '<tr><td>' + r.word + '</td><td>' + (r.phonetic||'') + '</td><td>'
        + (r.pos||'') + '</td><td>' + (r.meaning_zh||'') + '</td><td>'
        + (r.state||'NEW') + '</td></tr>';
    }).join('');
  }
}

// 复习中心
var dueCount = document.getElementById('due-count');
var cardsBox = document.getElementById('cards');
if (dueCount && cardsBox) {
  var STATE = { list: [], idx: 0 };
  fetch('/api/due').then(function(r){ return r.json(); }).then(function(data){
    STATE.list = data.words || [];
    dueCount.textContent = STATE.list.length;
    renderCard();
  }).catch(function(){
    dueCount.textContent = '请先运行 xiaohan serve';
  });
  function renderCard() {
    if (STATE.idx >= STATE.list.length) {
      cardsBox.innerHTML = '<p>今天全部复习完，休息一下！</p>';
      return;
    }
    var w = STATE.list[STATE.idx];
    cardsBox.innerHTML =
      '<div class="rcard"><h3>' + w.word + ' <span class="phon">' + (w.phonetic||'') + '</span></h3>' +
      '<audio controls preload="none" src="' + w.audio_url + '"></audio>' +
      '<p><b>释义：</b>' + (w.meaning||'') + '</p>' +
      '<p><b>例句：</b>' + (w.example||'') + '</p>' +
      '<div class="rbtns">' +
      '<button data-q="0">完全忘了</button>' +
      '<button data-q="3">想起来了</button>' +
      '<button data-q="5">完全掌握</button>' +
      '</div></div>';
    cardsBox.querySelectorAll('.rbtns button').forEach(function(btn){
      btn.addEventListener('click', function(){
        submit(w.word, parseInt(btn.getAttribute('data-q'), 10));
      });
    });
  }
  function submit(word, q) {
    fetch('/api/review', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({word: word, quality: q, channel: 'web'})
    }).then(function(r){ return r.json(); }).then(function(data){
      STATE.idx += 1;
      dueCount.textContent = Math.max(0, STATE.list.length - STATE.idx);
      renderCard();
    });
  }
}
