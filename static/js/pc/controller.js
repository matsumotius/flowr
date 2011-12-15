var hour = 12;
var min = 0;
var sec = 0;
var newhour;
var newmin;
var newsec;
var mintable = [];
var hourtable = [];
var sectable = [];

var centerx = 200.0;
var centery = 200.0;
var radius = centerx * 0.9;

var prevangle, newangle, origangle;
var angle = 0.0;
var diff;

var clicked = false;
var mousedownx, mousedowny;
var mousex, mousey;

var iPhone = false;
var canvas;
var controller;
var user;
onload = function() {
  controller = io.connect('http://localhost/controller'); 
  
  settime(hour,min,sec);
  canvas = document.getElementById('canvas');
  canvas.width = centerx * 2;
  canvas.height = centery * 2;
  drawCircle();
  iPhone = navigator.userAgent.match(/iPhone/) || 
           navigator.userAgent.match(/iPad/) ||
           navigator.userAgent.match(/Android/);
  if(iPhone){
    document.addEventListener("touchstart", mousedown, false);
    document.addEventListener("touchend", mouseup, false);
    document.addEventListener("touchmove", mousemove, false);
  }
  else {
    document.addEventListener('mousemove', mousemove, true);
    document.addEventListener('mouseup', mouseup, true);
    document.addEventListener('mousedown', mousedown, true);
  }
  user = {
    id : document.getElementById('attributes-user-id').innerHTML,
    name : document.getElementById('attributes-user-name').innerHTML
  };
  controller.on('joined', function(message) {
    console.log(message);
  });
  controller.emit('join', { user_id : user.id, type : 'controller' });
};

function enter() {
  controller.emit('enter', '');
}
function cancel() {
  controller.emit('cancel', '');
}
function getMouseX(e){
  var rect = e.target.getBoundingClientRect();
  return iPhone ? event.touches[0].pageX - rect.left : e.clientX - rect.left;
}

function getMouseY(e){
  var rect = e.target.getBoundingClientRect();
  return iPhone ? event.touches[0].pageY - rect.top : e.clientY - rect.top;
}

function mousedown(event){
  clicked = true;
  mousedownx = getMouseX(event);
  mousedowny = getMouseY(event);
  mousex = mousedownx;
  mousey = mousedowny;
  prevangle = Math.atan2(mousey-centery,mousex-centerx);

  origangle = angle;
  settime(hour,min,sec);
  settable(hour,min,sec);

  return false;
}

function mousemove(event){
  event.preventDefault();
  if(clicked){
    mousex = getMouseX(event);
    mousey = getMouseY(event);
    newangle = Math.atan2(mousey-centery,mousex-centerx);
    diff = newangle - prevangle;
    if(diff < -Math.PI) diff += 2*Math.PI;
    if(diff > Math.PI) diff -= 2*Math.PI;
    prevangle = newangle;
    angle += diff;
    /*
    document.getElementById('angle').innerHTML = angle;
    document.getElementById('diff').innerHTML = diff;
    document.getElementById('x').innerHTML = mousex-centerx;
    document.getElementById('y').innerHTML = mousey-centery;
    */
    drawCircle();

    ind = Math.floor((angle - origangle) * 20.0);
    if(hourtable[ind] != null){
      settime(hourtable[ind],mintable[ind],sectable[ind]);
      if((newhour !== undefined && newmin !== undefined && newsec !== undefined) && 
         (newhour !== hourtable[ind] || newmin !== mintable[ind] || newsec !== sectable[ind])) {
          controller.emit('move', { user_id : user.id, h : newhour, m : newmin, s : newsec });
      }
      newhour = hourtable[ind];
      newmin = mintable[ind];
      newsec = sectable[ind];
    }
  }
  return false;
}

function mouseup(event){
  hour = newhour;
  min = newmin;
  sec = newsec;

  clicked = false;
  return false;
}

function drawCircle() {
  var canvas = document.getElementById('canvas');
  if(! canvas || ! canvas.getContext) return false;
  var ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.fillStyle = 'rgb(155, 187, 89)'; // 緑
  ctx.arc(centerx, centery, radius, 0, Math.PI*2, true);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = 'rgb(255, 255, 0)';
  var cx = centerx + radius * 0.8 * Math.cos(angle);
  var cy = centery + radius * 0.8 * Math.sin(angle);
  ctx.arc(cx, cy, radius*0.1, 0, Math.PI*2, true);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = 'rgb(255, 255, 0)';
  var cx = centerx + radius * 0.8 * Math.cos(angle+Math.PI);
  var cy = centery + radius * 0.8 * Math.sin(angle+Math.PI);
  ctx.arc(cx, cy, radius*0.1, 0, Math.PI*2, true);
  ctx.fill();
}

function settime(hour,min,sec){
  var s;
  document.getElementById('hour').innerHTML = hour;
  s = '0'+min;
  document.getElementById('min').innerHTML = s.substr(s.length-2,2);
  s = '0'+sec;
  document.getElementById('sec').innerHTML = s.substr(s.length-2,2);
}

function settable(hour,min,sec){
  var ind = 0;
  var h, m, s;
  var i, j;
  var count;
  hourtable = [];
  mintable = [];
  sectable = [];
  hourtable[ind] = hour;
  mintable[ind] = min;
  sectable[ind] = sec;
  h = hour;
  m = min;
  s = sec;
  ind--; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
  for(i=0;i<10;i++){
    if(s > 0){ s -= 1; }
    else {
      if(m > 0){ m -= 1; s = 59; }
      else { if(h > 0){ h -= 1; m = 59; s = 59; }}
    }
    for(j=0;j<2;j++){
      ind--; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
  }
  for(i=0;i<8;i++){
    if(s % 10 != 0){ s = s - s % 10; }
    else {
      if(s > 0){ s -= 10; }
      else {
        if(m > 0){ m -= 1; s = 50; }
        else { if(h > 0) h -= 1; m = 59; s = 50; }
      }
    }
    for(j=0;j<4;j++){
      ind--; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
  }
  for(i=0;i<10;i++){
    if(m > 0){ m -= 1; s = 0; } else { if(h > 0){ h -= 1; m = 59; s = 0;}}
    for(j=0;j<6;j++){
      ind--; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
  }
  for(i=0;i<8;i++){
    if(m % 10 != 0){ m = m - m % 10; s = 0; }
    else {
      if(m > 0){ m -= 10; s = 0; } else { if(h > 0){ h -= 1; m = 50; s = 0;}}
    }
    for(j=0;j<8;j++){
      ind--; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
  }
  for(;;){
    if(m % 60 != 0){ m = 0; s = 0; }
    else {
      if(h > 0){ h -= 1; m = 0; s = 0;}
    }
    for(j=0;j<10;j++){
      ind--; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
    if(h == 0) break;
  }
  for(j=0;j<20;j++){
    ind--; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
  }
  h = hour;
  m = min;
  s = sec;
  ind = 0;
  for(i=0;i<10;i++){
    if(s < 59){ s += 1; }
    else {
      if(m < 59){ m += 1; s = 0; }
      else { if(h < 23){ h += 1; m = 0; s = 0; } else { h = 23; m = 59; s = 59; }}
    }
    for(j=0;j<2;j++){
      ind++; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
  }
  for(i=0;i<8;i++){
    if(s % 10 != 0){
      s = s - s % 10;
      if(s == 50){
        if(m < 59){
          m += 1; s = 0;
        }
      }
      else {
        s += 10;
      }
    }
    else {
      if(s < 50){ s += 10; }
      else {
        if(m < 59){ m += 1; s = 0; }
        else { if(h < 23){ h += 1; m = 0; s = 0; } else { h = 23; m = 59; s = 59;}}
      }
    }
    for(j=0;j<4;j++){
      ind++; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
  }
  for(i=0;i<10;i++){
    if(m < 59){ m += 1; s = 0; }
    else { if(h < 23){ h += 1; m = 0; s = 0; } else {h = 23; m = 59; s = 59; }}
    for(j=0;j<6;j++){
      ind++; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
  }
  for(i=0;i<8;i++){
    if(m % 10 != 0){
      m = m - m % 10;
      if(m == 50){
        if(h < 23){
          h += 1; m = 0; s = 0;
        }
      }
      else {
        m += 10; s = 0;
      }
    }
    else {
      if(m < 50){ m += 10; s = 0; }
      else { if(h < 23){ h += 1; m = 0; s = 0;} else { h = 23; m = 59; s = 59; }}
    }
    for(j=0;j<8;j++){
      ind++; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
  }
  for(;;){
    if(m % 60 != 0){
      if(h < 23){
        h += 1; m = 0; s = 0;
      }
      else {
        m = 59; s = 59;
      }
    }
    else {
      if(h < 23){ h += 1; m = 0; s = 0;}
      else { m = 59; s = 59;}
    }
    for(j=0;j<10;j++){
      ind++; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
    }
    if(h == 23 && m == 59 && s == 59) break;
  }
  for(j=0;j<20;j++){
    ind++; hourtable[ind] = h; mintable[ind] = m; sectable[ind] = s;
  }
}
