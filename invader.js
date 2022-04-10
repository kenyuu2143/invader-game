(function(w,d){

  var __options = {
    canvas_size : { x : null , y : null },
    bitmap_size : { w : 48 , h : 48},

    cannon : {
      color : "#57F2D6",
      bitSize : 4,
      src   : "images/dot/cannon.dot",
      x : 0 , y : 0,
      moveX : 10
    },
    cannon_shoot : {
      w : 1,
      h : 3
    },
    ufo : {
      color : "white",
      src   : "images/dot/ufo.dot",
      x : 0 , y : 0,
      moveX : 10
    },
    
    invader_effect_1 : {
      color : "white",
      src   : "images/dot/invader_effect_1.dot",
      x : 0 , y : 0,
    },

    tochika : {
      color : "red",
      src   : "images/dot/tochika.dot",
      w     : 72,
      rate  : 2.5
    },
    
    invader_src : {
      "crab" : [
        'images/dot/crab_1.dot',
        "images/dot/crab_2.dot"
      ],
      "octpus" : [
        "images/dot/octpus_1.dot",
        "images/dot/octpus_2.dot"
      ],
      "squid" : [
        "images/dot/squid_1.dot",
        "images/dot/squid_2.dot"
      ]
    },
    invader_row_infos : [
      { invader : "squid" , color : "#68F205"},
      { invader : "crab"  , color : "#68F205"},
      { invader : "crab"  , color : "#57F2D6"},
      { invader : "octpus", color : "#57F2D6"},
      { invader : "octpus", color : "#F22786"}
    ],
    invader_config : {
      type   : "invader",
      margin : 10, // display-margin
      move_x : 4, // [1:right , -1:left]
      move_y : 4
    },
    bullet : {
      color : "white",
      x : 0 , y : 0,
      moveY : 4
    },
    bullet_anim : [
      "images/dot/bullet_1.dot",
      "images/dot/bullet_2.dot"
    ],
    del_block : [
      "01110",
      "01010",
      "00100"
    ],

    game_start : {
      color_fill   : "black",
      color_stroke : "blue",
      width_stroke : 2,
      text_color   : "white",
      text_size    : 16,
      text_width   : 0.9,
      text_font    : "sans-serif",
      radius       : 4,
      width        : 0.7,
      height       : 0.3
    },
    game_over : {
      color_fill   : "black",
      color_stroke : "red",
      width_stroke : 2,
      text_color   : "white",
      text_size    : 16,
      text_width   : 0.9,
      text_font    : "sans-serif",
      radius       : 4,
      width        : 0.7,
      height       : 0.3
    },
    sounds : {
      "shoot" : {
        mode : "se",
        src  : "sounds/shoot.mp3"
      },
      "bgm"   : {
        mode : "loop",
        src  : "sounds/bgm.mp3"
      }
    }
  };

  var MAIN = function(canvas_selector){
    this.canvas_selector = canvas_selector || "canvas";
    this.pattern = 0;
    this.shoots = [];
    this.view_flg = "game_start";

    this.setCanvas(this.canvas_selector);
    this.set_imageMax();
    this.event_set();
    this.bitmap_load();
    this.sound_load();

    // this.game_start();

    // this.view();
    this.animation_roop();
  };

  MAIN.prototype.setCanvas = function(selector){
    this.canvas_elm = d.querySelector(selector);
    if(!this.canvas_elm){return;}
    this.canvas_elm.style.setProperty("background-color","black","");
    
    if(w.innerWidth < this.canvas_elm.offsetWidth){
      this.canvas_elm.setAttribute("width" , w.innerWidth);
    }
    if(w.innerHeight < this.canvas_elm.offsetHeight){
      this.canvas_elm.setAttribute("height" , w.innerHeight);
    }

    __options.canvas_size.x = this.canvas_elm.offsetWidth;
    __options.canvas_size.y = this.canvas_elm.offsetHeight;
    __options.cannon.y      = __options.canvas_size.y - 100;

    // smooth-off
    this.ctx = this.canvas_elm.getContext("2d");
    this.ctx.imageSmoothingEnabled       = false;
    this.ctx.mozImageSmoothingEnabled    = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled     = false;
  };

  

  MAIN.prototype.clear = function(){
    this.ctx.clearRect(0, 0,  this.canvas_elm.width,  this.canvas_elm.height);
  };

  MAIN.prototype.bitmap_load = function(){
    var bitmap_files = [];
    for(var i in __options.invader_src){
      for(var j=0; j<__options.invader_src[i].length; j++){
        this.image_bit_set(__options.invader_src[i][j]);
      }
    }
    for(var i=0; i<__options.bullet_anim.length; i++){
      this.image_bit_set(__options.bullet_anim[i]);
    }
    this.image_bit_set(__options.cannon.src);
    this.image_bit_set(__options.ufo.src);
    this.image_bit_set(__options.invader_effect_1.src);
    this.image_bit_set(__options.tochika.src , __options.tochika.w);
  };

  MAIN.prototype.view = function(){
    // invader
    this.view_invader();

    // canon
    this.image(__options.cannon);

    // tochika
    this.view_tochika();
  }

  MAIN.prototype.view_invader = function(){
    if(typeof __options.invaders === "undefined"){
      this.init_invaders_info();
    }
    for(var i in __options.invaders){
      for(var j in __options.invaders[i]){
        if(typeof __options.invaders[i][j][0].shoot_flg !== "undefined"){
          if(__options.invaders[i][j][0].shoot_flg <= 2){
            __options.invaders[i][j][0].shoot_flg++;
          }
          else{
            __options.invaders[i].splice(j,1);
            continue;
          }
        }
        this.image(__options.invaders[i][j][this.pattern]);
      }
    }
  };

  MAIN.prototype.view_tochika = function(){
    if(typeof this.image_cache[__options.tochika.src] === "undefined"
    || typeof this.image_cache[__options.tochika.src].bitmap === "undefined"
    || !this.image_cache[__options.tochika.src].bitmap.length){return;}
    if(typeof __options.tochikas === "undefined"){
      this.init_tochilas_info();
    }
    // 配置間隔
    var rate = __options.tochika.rate;
    // 配置計算
    var tochika_count = Math.floor(this.canvas_elm.offsetWidth / (__options.tochika.w * rate));
    var margin = (this.canvas_elm.offsetWidth - ((__options.tochika.w * rate) * tochika_count)) / 2;
    var centering = __options.tochika.w * (rate - 1) /2;
    var y = this.canvas_elm.offsetHeight - 170;
    for(var i in __options.tochikas){
      __options.tochikas[i].x = margin + ((__options.tochika.w * rate) * i) + centering;
      __options.tochikas[i].y = y;
      __options.tochikas[i].bitsize = __options.tochikas[i].bitsize || this.image_cache[__options.tochika.src].bitsize;
      __options.tochikas[i].h = __options.tochikas[i].bitsize * __options.tochikas[i].bitmap.length;
      this.image(__options.tochikas[i]);
    }
  };

  MAIN.prototype.init_invaders_info = function(){
    // 配置マージン
    margin = __options.invader_config.margin;
    // 配置個数（w）
    var count_w = Math.floor((__options.canvas_size.x - margin * 2) / __options.bitmap_size.w) -2;

    // 敵機配置情報作成
    __options.invaders = [];
    for(var i=0; i<__options.invader_row_infos.length; i++){
      var type = __options.invader_row_infos[i].invader;
      __options.invaders[i] = [];
      var srcs = __options.invader_src[type];
      for(var j=0; j<count_w; j++){
        __options.invaders[i][j] = [];
        for(var k=0; k<srcs.length; k++){
          __options.invaders[i][j][k] = {
            color : __options.invader_row_infos[i].color,
            x     : (j * __options.bitmap_size.w) + margin,
            y     : (i * __options.bitmap_size.h) + margin,
            type  : type,
            src   : srcs[k]
          };
        }
      }
    }
  };
  MAIN.prototype.init_tochilas_info = function(){
    __options.tochikas = [];
    var rate = __options.tochika.rate;
    var tochika_count = Math.floor(this.canvas_elm.offsetWidth / (__options.tochika.w * rate));
    var bitmap = this.image_cache[__options.tochika.src].bitmap;
    for(var i=0; i<tochika_count; i++){
      __options.tochikas.push({
        src     : __options.tochika.src,
        color   : __options.tochika.color,
        bitmap  : JSON.parse(JSON.stringify(bitmap))
      });
    }
  };

  MAIN.prototype.image_cache = [];
  MAIN.prototype.image = function(options){
    if(!this.canvas_elm){return;}
    if(!options){return;}
    if(typeof this.image_cache[options.src] === "undefined"){return}
    var bitmap  = this.get_bitmap(options);
    var bitsize = this.get_bitsize(options);
    this.image_bit_make(bitmap , bitsize , options.color , options.x , options.y);
  };

  MAIN.prototype.get_bitmap = function(option){
    if(typeof option.bitmap !== "undefined"){
      return option.bitmap;
    }
    else if(typeof this.image_cache[option.src] !== "undefined"
    && typeof this.image_cache[option.src].bitmap !== "undefined"){
      return this.image_cache[option.src].bitmap;
    }
  };
  MAIN.prototype.get_bitsize = function(option){
    if(typeof this.image_cache[option.src] !== "undefined"
    || typeof this.image_cache[option.src].bitsize !== "undefined"){
      return this.image_cache[option.src].bitsize;
    }
  };

  MAIN.prototype.image_bit_set = function(src , bitmap_size){
    if(typeof this.image_cache[src] !== "undefined"){return;}
    bitmap_size = bitmap_size || __options.bitmap_size.w;
    this.image_cache[src] = {
      bitsize : 0,
      bitmap  : []
    };
    new AJAX({
      url       : src,
      methdo    : "GET",
      async     : true,
      onSuccess : (function(src , bitmap_size , data){
        this.image_bit_loaded(src , bitmap_size , data);
      }).bind(this , src , bitmap_size)
    });
  };
  MAIN.prototype.image_bit_loaded = function(src , bitmap_size , data){
    var char16    = data.split("\n");
    var str_count = char16[0].length * 4;
    var size      = bitmap_size / str_count;
    // ゼロパディング用桁数算出
    var zero = new Array(str_count).fill("0").join("")
    for(var i in char16){
      // 16進数を２進数に変換
      var char2 = parseInt(char16[i] , 16).toString(2);
      // サイズ取得
      this.image_cache[src].bitsize = size;
      char2 = (zero + char2).slice(-str_count);
      this.image_cache[src].bitmap.push(char2);
    }
    // 上下左右の余白（マージン）値の取得
    this.set_bitmap_margin(src , size);
  };
  // 上下左右の余白（マージン）値の取得
  MAIN.prototype.set_bitmap_margin = function(src , bitsize){
    if(typeof this.image_cache[src] === "undefined"){return;}
    var cache = this.image_cache[src];
    if(typeof cache.bitmap === "undefined"){return;}
    var bitmap = cache.bitmap;
    cache.margin = {
      top    : 0,
      bottom : 0,
      left   : 0,
      right  : 0
    };

    for(var i=0; i<bitmap.length; i++){
      if(bitmap[i].indexOf("1") !== -1){
        // cache.margin.top = i;
        cache.margin.top = i * bitsize;
        break;
      }
    }

    for(var i=bitmap.length-1; i>=0; i--){
      if(bitmap[i].indexOf("1") !== -1){
        // cache.margin.bottom = bitmap.length-1 - i;
        cache.margin.bottom = (bitmap.length-1 - i) * bitsize;
        break;
      }
    }

    var bitmap2 = new LIB().bin_convert_col2row(bitmap);

    for(var i=0; i<bitmap2.length; i++){
      if(bitmap2[i].indexOf("1") !== -1){
        // cache.margin.right = i;
        cache.margin.right = i * bitsize;
        break;
      }
    }

    for(var i=bitmap2.length-1; i>=0; i--){
      if(bitmap2[i].indexOf("1") !== -1){
        // cache.margin.left = bitmap2.length-1 - i;
        cache.margin.left = (bitmap2.length-1 - i) * bitsize;
        break;
      }
    }
  };


  MAIN.prototype.image_bit_make = function(bitmap , bitsize , color , x , y){
    if(!bitmap){return;}
    color = color || "white";
    this.ctx.fillStyle = color;
    for(var i=0; i<bitmap.length; i++){
      for(var j=0; j<bitmap[i].length; j++){
        var bit = bitmap[i].charAt(j);
        if(bit == 0){continue;}
        var w = bitsize;
        var h = bitsize;
        this.ctx.fillRect(x+(j * w) , y+(i * h) , Math.ceil(w) , Math.ceil(h));
      }
    }
  };

  MAIN.prototype.animation_roop = function(time){
    switch(this.view_flg){
      case "game_start":
        this.game_start();
        break;

      case "game_over":
        this.game_over();
        break;

      default:
        var func = (function(e){this.animation(e)}).bind(this);

        this.animation_proc();
    
        if(window.requestAnimationFrame
        ||  window.webkitRequestAnimationFrame
        ||  window.mozRequestAnimationFrame
        ||  window.oRequestAnimationFrame
        ||  window.msRequestAnimationFrame){
          window.requestAnimationFrame(func);
        }
        else{
          time = time || 10;
          anim_flg = setTimeout(func , time);
        }
        break;
    }
    
  };

  MAIN.prototype.animation_proc = function(){
    switch(this.keydown_flg){
      case "right":
        this.cannon_move(__options.cannon.x + __options.cannon.moveX);
        break;
      case "left":
        this.cannon_move(__options.cannon.x - __options.cannon.moveX);
        break;
    }
    this.animation_shoot();
  };

  MAIN.prototype.animation_shoot = function(){
    if(!this.shoots.length){return;}
    var bitsize = this.image_cache[__options.cannon.src].bitsize;
    var w = bitsize * __options.cannon_shoot.w;
    var h = bitsize * __options.cannon_shoot.h;
    var target = null;
    for(var i in this.shoots){
      
      // collision tochika
      if(target = this.collision_tochika(this.shoots[i].x , this.shoots[i].y , w , h)){
        var flg = this.tochika_scrape_shoot(target , this.shoots[i].x , this.shoots[i].y);
        if(flg){
          this.shoots.splice(i,1);
          continue;
        }
      }
      // collosion invader
      else if(this.shoot_collision_invader(this.shoots[i].x , this.shoots[i].y , w , h)){
        this.shoots.splice(i,1);
        continue;
      }
      // 画面外
      else if(this.shoots[i].y < h){
        this.shoots.splice(i,1);
        continue;
      }
      
      // 通常表示
      this.ctx.fillStyle   = "white";
      this.ctx.fillRect(this.shoots[i].x - bitsize , this.shoots[i].y , w , h);
      this.shoots[i].y -= bitsize * 2;
    }
  };

  MAIN.prototype.animation_bullet = function(){
    if(typeof this.bullets === "undefined" || !this.bullets.length){return;}
    var current_time = (+new Date());

    // アニメーションパターンのフレーム感覚
    if(typeof this.bullet_anim_time === "undefined"){
      this.bullet_anim_time = current_time;
    }

    // アニメーションパターンの切り替え
    if(typeof this.bullet_anim_num === "undefined"){
      this.bullet_anim_num = 0;
    }
    else if(current_time - this.bullet_anim_time > 50){
      this.bullet_anim_time = current_time;
      this.bullet_anim_num++;
      if(this.bullet_anim_num >= __options.bullet_anim.length){
        this.bullet_anim_num = 0;
      }
    }

    var cache   = this.image_cache[__options.bullet_anim[this.bullet_anim_num]];
    if(!cache){return;}
    var bitsize = cache.bitsize;
    for(var i in this.bullets){
      this.bullets[i].y += bitsize;
      var y = this.bullets[i].y;
      var target = null;

      // 画面外に出たbulletは削除する
      if(y > this.canvas_elm.offsetHeight){
        this.bullets[i] = null;
        continue;
      }

      // tochika collision
      else if(target = this.collision_tochika(
        this.bullets[i].x , 
        this.bullets[i].y , 
        __options.bitmap_size.w , 
        __options.bitmap_size.h ,
        cache.margin
      )){
        var flg = this.tochika_scrape_bullet(target , this.bullets[i].x + (__options.bitmap_size.h/2) , this.bullets[i].y + __options.bitmap_size.h);
        if(flg === true){
          this.bullets[i] = null;
          continue;
        }
      }

      // 自機collision
      else if(this.collosion_bullet_own(
        this.bullets[i].x , 
        this.bullets[i].y , 
        __options.bitmap_size.w , 
        __options.bitmap_size.h ,
        cache.margin
      )){
        this.view_flg = "game_over";
        break;;
      }

      // 通常表示処理
      var option = {
        x : this.bullets[i].x,
        y : y = y,
        src : __options.bullet_anim[this.bullet_anim_num],
        color : __options.bullet.color
      };
      this.image(option);
    }
    var newArr = [];
    for(var i in this.bullets){
      if(!this.bullets[i]){continue;}
      newArr.push(this.bullets[i]);
    }
    this.bullets = newArr;
  };

  MAIN.prototype.shoot_collision_invader = function(x , y , w , h){
    var inv = __options.invaders;
    for(var i in inv){
      for(var j in inv[i]){
        var ix = inv[i][j][0].x;
        var iy = inv[i][j][0].y;
        var iw = __options.bitmap_size.w;
        var ih = __options.bitmap_size.h;
        if(ix < x + w && x < ix + iw
        && iy < y - h && y < iy + ih){
          for(var k=0; k<inv[i][j].length; k++){
            inv[i][j][k].src = __options.invader_effect_1.src;
            inv[i][j][k].shoot_flg = 1;
          }
          return true;
        }
      }
    }
  };

  MAIN.prototype.collision_tochika = function(x , y , w , h , margin){
    for(var i in __options.tochikas){
      var tx = __options.tochikas[i].x;
      var ty = __options.tochikas[i].y;
      var tw = __options.tochika.w;
      var th = __options.tochikas[i].h;
      var margin_top    = margin ? margin.top    : 0;
      var margin_bottom = margin ? margin.bottom : 0;
      var margin_left   = margin ? margin.left   : 0;
      var margin_right  = margin ? margin.right  : 0;
      if(tx + margin_left < x + w && x <= tx + tw - margin_right
      && ty < y + h - margin_bottom && y < ty + th - margin_bottom){
        return __options.tochikas[i];
      }
    }
    return false;
  };

  MAIN.prototype.tochika_scrape_shoot = function(tochika_data , shoot_x , shoot_y){
    // 衝突したtochikaの下部分を検出
    var x = shoot_x - tochika_data.x;
    var y = shoot_y - tochika_data.y;
    var dot_x = Math.round(x / tochika_data.bitsize);
    var dot_y = Math.round(y / tochika_data.bitsize);
    dot_x -= 1; // ドット絵のズレ対応

    if(typeof tochika_data.bitmap[dot_y] === "undefined"){
      dot_y = dot_y < 0 ? 0 : tochika_data.bitmap.length-1;
    }
    if(typeof tochika_data.bitmap[dot_y][dot_x] === "undefined"){
      dot_x = dot_x < 0 ? 0 : tochika_data.bitmap[dot_y].length -1;
    }

    var del_block = "0";
    // 当たった座標のドット部分を選択 衝突箇所以下を削除
    for(var i=tochika_data.bitmap.length-1; i>=0; i--){
      if(tochika_data.bitmap[i][dot_x] != 1){continue;}
      // 座標判定
      if(shoot_y >= tochika_data.y + ((i-1) * tochika_data.bitsize)){
        return false;
      }
      var str = tochika_data.bitmap[i];
      tochika_data.bitmap[i] = str.slice(0 , dot_x).concat(del_block , str.slice(dot_x + del_block.length));
      return true;
    }
    return false;
  };

  MAIN.prototype.tochika_scrape_bullet = function(tochika_data , bullet_x , bullet_y){
    // 衝突したtochikaの下部分を検出
    var x = bullet_x - tochika_data.x;
    var y = bullet_y - tochika_data.y;
    var dot_x = Math.round(x / tochika_data.bitsize);
    var dot_y = Math.round(y / tochika_data.bitsize);

    if(typeof tochika_data.bitmap[dot_y] === "undefined"){
      dot_y = dot_y < 0 ? 0 : tochika_data.bitmap.length -1;
    }
    if(typeof tochika_data.bitmap[dot_y][dot_x] === "undefined"){
      dot_x = dot_x < 0 ? 0 : tochika_data.bitmap[dot_y].length -1;
    }

    // 当たった座標のドット部分を選択 衝突箇所以下を削除
    for(var i=0; i<tochika_data.bitmap.length; i++){
      if(tochika_data.bitmap[i][dot_x] != 1){continue;}
      var zero = Array(tochika_data.bitmap[i].length + 1).join("0");

      for(var j=0; j<__options.del_block.length; j++){
        num = i + j;
        if(typeof tochika_data.bitmap[num] === "undefined" || !tochika_data.bitmap[num]){break;}
        var str      = tochika_data.bitmap[num];
        var shift    = str.length - dot_x - __options.del_block[j].length + Math.ceil(__options.del_block[j].length/2);
        shift        = shift > 0 ? shift : 0;
        var delbit   = (String("0b"+ __options.del_block[j]) << shift).toString(2);
        newbit = ((String("0b"+str)) & ~String("0b"+delbit)).toString(2);
        newbit = (zero + String(newbit)).slice(-str.length);
        tochika_data.bitmap[num] = newbit;
      }
      return true;
    }
    return false;
  };

  // invader-bulletと自機の衝突確認
  MAIN.prototype.collosion_bullet_own = function(x , y , w , h , margin){
    var tx = __options.cannon.x;
    var ty = __options.cannon.y;
    var tw = __options.bitmap_size.w;
    var th = __options.bitmap_size.h;
    var margin_top    = margin ? margin.top    : 0;
    var margin_bottom = margin ? margin.bottom : 0;
    var margin_left   = margin ? margin.left   : 0;
    var margin_right  = margin ? margin.right  : 0;
// console.log(tx+"/"+ty+":"+tw+"/"+th);
    if(tx + margin_left < x + w
    && x <= tx + tw - margin_right
    && ty < y + h - margin_bottom
    && y < ty + th - margin_bottom){
      return true;
    }
    else{
      return false;
    }
    
  };

  MAIN.prototype.cannon_move = function(pos){
    if(pos < 0){
      pos = 0;
    }
    else if(pos > this.canvas_elm.offsetWidth - __options.bitmap_size.w){
      pos = this.canvas_elm.offsetWidth - __options.bitmap_size.w;
    }
    __options.cannon.x = pos;
  };

  MAIN.prototype.animation = function(){
    this.bgm_loop();
    this.clear();
    this.nextPattern(300);
    this.view();
    this.animation_roop(30);
    this.invader_bullet();
  }
  MAIN.prototype.nextPattern = function(frame_rate){
    this.prev_time = this.prev_time || 0;
    if((+new Date()) - this.prev_time < frame_rate){return}
    this.prev_time = (+new Date());

    this.pattern++;
    if(this.pattern >= this.image_max){
      this.pattern = 0;
    }

    this.invader_move();
  };

  MAIN.prototype.invader_move = function(){
    // 左端の情報取得
    var window_min = __options.invader_config.margin;
    var window_max = this.canvas_elm.offsetWidth - __options.invader_config.margin;
    var pos        = this.invader_pos();
    var move_x     = __options.invader_config.move_x;
    var move_y     = 0;
    var w          = __options.bitmap_size.w;

    // move y
    if(typeof this.move_y_count !== "undefined" && this.move_y_count > 0){
      this.move_y_count -= 1;
      move_y = __options.invader_config.move_y;
      move_x = 0;
    }
    // Dead end ->
    else if(move_x > 0 && pos.max > window_max){
      this.move_y_count = 1;
      __options.invader_config.move_x = -__options.invader_config.move_x;
      move_x = 0;
      move_y = __options.invader_config.move_y;
    }
    // <- Dead end
    else if(move_x < 0 && pos.min < window_min){
      this.move_y_count = 1;
      __options.invader_config.move_x = -__options.invader_config.move_x;
      move_x = 0;
      move_y = __options.invader_config.move_y;
    }
    this.invader_move_set(move_x , move_y);
  };

  // mode @ [min : 一番左端のinvaderの座標を取得 . max : 一番右端のinvaderの座標を取得]
  MAIN.prototype.invader_pos = function(mode){
    var min = null;
    var max = null;
    var inv = __options.invaders;
    var w   = __options.bitmap_size.w;
    for(var i in inv){
      for(var j in inv[i]){
        if(min === null || min > inv[i][j][0].x){
          min = inv[i][j][0].x;
        }
        if(max === null || max < inv[i][j][0].x + w){
          max = inv[i][j][0].x + w;
        }
      }
    }
    if(mode === "min"){
      return min;
    }
    else if(mode === "max"){
      return max;
    }
    else{
      return {min : min , max : max};
    }
  };

  MAIN.prototype.invader_move_set = function(x,y){
    var inv = __options.invaders;
    for(var i in inv){
      for(var j in inv[i]){
        for(var k in inv[i][j]){
          inv[i][j][k].x += x;
          inv[i][j][k].y += y;
        }
      }
    }
  };

  // 各列の一番下のインベーダーがミサイルを発射する（最大同時数:2）
  MAIN.prototype.invader_bullet = function(){
    if(typeof this.bullets === "undefined"){
      this.bullets = [];
    }
    this.invader_bullet_add();
    this.animation_bullet();
  };
  MAIN.prototype.invader_bullet_add = function(){
    if(this.bullets.length >= __options.bullet_anim.length){return;}
    if(Math.floor(Math.random() * Math.floor(100)) > 10){return;}
    var bottoms = this.get_invader_bottoms();
    var keys    = Object.keys(bottoms);
    if(!bottoms || !keys.length){return;}
    var rnd_num = Math.floor(Math.random() * Math.floor(keys.length));
    var data = {
      x : bottoms[keys[rnd_num]].x,
      y : bottoms[keys[rnd_num]].y + __options.bitmap_size.h
    };
    this.bullets.push(data);
  };

  // 各列の最下部インベーダー一覧の取得
  MAIN.prototype.get_invader_bottoms = function(){
    var inv = __options.invaders;
    var bottoms = {};
    for(var i=inv.length-1; i>=0; i--){
      for(var j in inv[i]){
        if(!inv[i][j]){continue;}
        var x = inv[i][j][0].x;
        if(typeof bottoms[x] !== "undefined"){continue;}
        bottoms[x] = inv[i][j][0];
      }
    }
    return bottoms;
  };


  MAIN.prototype.set_imageMax = function(){
    for(var i in __options.invader_src){
      this.image_max = __options.invader_src[i].length;
      break;
    }
  };

  /* Event */
  MAIN.prototype.event_set = function(){
    new LIB().event(w , "click"      , (function(e){this.click(e)}).bind(this));
    new LIB().event(w , "keydown"    , (function(e){this.keydown(e)}).bind(this));
    new LIB().event(w , "keyup"      , (function(e){this.keyup(e)}).bind(this));
    new LIB().event(w , "mousemove"  , (function(e){this.mousemove(e)}).bind(this));
    new LIB().event(w , "touchmove"  , (function(e){this.touchmove(e)}).bind(this));
    new LIB().event(w , "touchend"   , (function(e){this.touchend(e)}).bind(this));
  };

  MAIN.prototype.click = function(e){
    switch(this.view_flg){
      case "game_start":
        this.view_flg = "play";
        this.data_reset();
        // this.view();
        this.bgm_start();
        this.animation_roop();
        
        break;
      case "game_over":
        this.view_flg = "play";
        this.data_reset();
        // this.view();
        this.bgm_start();
        this.animation_roop();
        break;
      default:
        this.shoot_add();
        break;
    }
    
  };

  MAIN.prototype.shoot_add = function(){
    if(this.shoots.length < 2){
      this.shoots.push({
        x : __options.cannon.x + (__options.bitmap_size.w / 2),
        y : __options.cannon.y + (__options.cannon.bitSize * 4)
      });
      this.audio.shoot.currentTime = 0
      this.audio.shoot.play();
      
    }
  };

  MAIN.prototype.keydown = function(e){
    switch(e.keyCode){
      case 37:  // <-
      case 'ArrowLeft':
      this.keydown_flg = "left";
      break;

      case 39:  // ->
      case 'ArrowRight':
      this.keydown_flg = "right";
      break;

      case 32:  // space
      this.shoot_add();
      break;
    }
  };

  MAIN.prototype.keyup = function(e){
    this.keydown_flg = false;
  };

  MAIN.prototype.mousemove = function(e){
    // if(this.flg_gamestart !== true){return;}

    this.mousePos = this.mousePos || e.clientX;
    this.cannon_move(__options.cannon.x + (e.clientX - this.mousePos));
    this.mousePos = e.clientX;
  };

  MAIN.prototype.touchmove = function(e){
    // if(this.flg_gamestart !== true){return;}

    if(!e || !e.touches || e.touches.length > 1){
      this.mousePos = null;
      return;
    }
    this.mousePos = typeof this.mousePos === "number" ? this.mousePos : e.touches[0].clientX;
    this.cannon_move(__options.cannon.x + (e.touches[0].clientX - this.mousePos));
    this.mousePos = e.touches[0].clientX;
  };
  MAIN.prototype.touchend = function(e){
    this.mousePos = null;
  };

  MAIN.prototype.sound_load = function(){
    if(typeof __options.sounds === "undefined" || !Object.keys(__options.sounds).length){return;}
    this.audio = {};
    for(var i in __options.sounds){
      this.audio[i] = new Audio(__options.sounds[i].src);
      this.audio[i].onloadedmetadata = (function(target){
        console.log(target);
      }).bind(this , this.audio[i]);
    }
  };

  MAIN.prototype.bgm_start = function(){
    this.audio.bgm.currentTime = 0;
    this.audio.bgm.play();
  };
  MAIN.prototype.bgm_loop = function(){
    if(this.audio.bgm.currentTime + 0.300 < this.audio.bgm.duration){return;}
    this.audio.bgm.currentTime = 0;
  };
  MAIN.prototype.bgm_stop = function(){console.log("bgm-stop");
    this.audio.bgm.pause();
  };




  var LIB  = function(){};

  LIB.prototype.event = function(target, mode, func , flg){
    flg = (flg) ? flg : false;
    if (target.addEventListener){target.addEventListener(mode, func, flg)}
    else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
  };

  LIB.prototype.bin_convert_col2row = function(bitmap){
    var newmap = [];
    for(var i in bitmap){
      for(var j=0; j<bitmap[i].length; j++){
        if(typeof newmap[j] === "undefined"){newmap[j] = "";}
        newmap[j] += bitmap[i][j];
      }
    }
    return newmap;
  };

  var AJAX = function(option){
    if(!option){return}
		var httpoj = this.createHttpRequest();
    if(!httpoj){return;}
    
		var data   = this.setQuery(option);
		if(!data.length){
			option.method = "get";
		}

		httpoj.open( option.method , option.url , option.async );
    httpoj.setRequestHeader('Content-Type', option.type);
		
		httpoj.onreadystatechange = function(){
			if (this.readyState==4 && httpoj.status == 200){
				option.onSuccess(this.responseText);
			}
		};

		// FormData 送信用
		if(typeof option.form === "object" && Object.keys(option.form).length){
			httpoj.send(option.form);
		}
		// query整形後 送信
		else{
			if(data.length){
				httpoj.send(data.join("&"));
			}
			else{
				httpoj.send();
			}
		}
  };
	AJAX.prototype.dataOption = {
		url:"",
		query:{},
		querys:[],
		data:{},
		form:{},
		async:"true",
		method:"POST",
		type:"application/x-www-form-urlencoded",
		onSuccess:function(res){},
		onError:function(res){}
	};
	AJAX.prototype.createHttpRequest = function(){
		//Win ie用
		if(window.ActiveXObject){
			//MSXML2以降用;
			try{return new ActiveXObject("Msxml2.XMLHTTP")}
			catch(e){
				//旧MSXML用;
				try{return new ActiveXObject("Microsoft.XMLHTTP")}
				catch(e2){return null}
			}
		}
		//Win ie以外のXMLHttpRequestオブジェクト実装ブラウザ用;
		else if(window.XMLHttpRequest){return new XMLHttpRequest()}
		else{return null}
  };
  // URL-Queryの作成
  AJAX.prototype.setQuery = function(option){
		var data = [];
		if(typeof option.datas !== "undefined"){
			for(var key of option.datas.keys()){
				data.push(key + "=" + option.datas.get(key));
			}
		}
		if(typeof option.query !== "undefined"){
			for(var i in option.query){
				data.push(i+"="+encodeURIComponent(option.query[i]));
			}
		}
		if(typeof option.querys !== "undefined"){
			for(var i=0;i<option.querys.length;i++){
				if(typeof option.querys[i] == "Array"){
					data.push(option.querys[i][0]+"="+encodeURIComponent(option.querys[i][1]));
				}
				else{
					var sp = option.querys[i].split("=");
					data.push(sp[0]+"="+encodeURIComponent(sp[1]));
				}
			}
		}
    return data;
  }


  MAIN.prototype.game_start = function(){
    this.view_flg = "game_start";
    this.dialog_window(__options.game_start);
    this.dialog_text(__options.game_start,[
      {text:"INVADER" , size:60 , margin:20 , weight:"bold" , color:"blue"},
      {text:"画面をクリックすると"},
      {text:"ゲームが開始します"}
    ]);
  };

  MAIN.prototype.game_over = function(){
    this.view_flg = "game_over";
    this.dialog_window(__options.game_over);
    this.dialog_text(__options.game_over , [
      {text:"Game over", size:60 , margin:20 , color:"red" , weight:"bold"},
      {text:"画面をクリックすると"},
      {text:"ゲームが開始します"}
    ]);
    this.bgm_stop();
  };

  MAIN.prototype.data_reset = function(){
    this.pattern = 0;
    this.shoots  = [];
    this.bullets = [];
    this.init_invaders_info();
    this.init_tochilas_info();
  };

  MAIN.prototype.dialog_window = function(options){
    var w = this.canvas_elm.offsetWidth  * options.width,
        h = this.canvas_elm.offsetHeight * options.height,
        x = this.canvas_elm.offsetWidth  / 2 * (1 - options.width),
        y = this.canvas_elm.offsetHeight / 2 * (1 - options.height),
        r = options.radius;
    h = h > 180 ? h : 180;
    this.ctx.fillStyle   = options.color_fill;
    this.ctx.strokeStyle = options.color_stroke;
    this.ctx.lineWidth   = options.width_stroke * 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x,y + r);
    this.ctx.arc(x+r , y+h-r , r , Math.PI , Math.PI*0.5 , true);
    this.ctx.arc(x+w-r , y+h-r , r , Math.PI*0.5,0 , 1);
    this.ctx.arc(x+w-r , y+r , r , 0 , Math.PI*1.5 , 1);
    this.ctx.arc(x+r , y+r , r , Math.PI*1.5 , Math.PI , 1);   
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();
  }
  MAIN.prototype.dialog_text = function(options,texts){
    var w = (this.canvas_elm.offsetWidth * options.width) * options.text_width;
    var x = this.canvas_elm.offsetWidth / 2;
    var y = this.canvas_elm.offsetHeight / 2 * (1 - options.height) + 30;

    for(var i=0; i<texts.length; i++){
      this.ctx.fillStyle    = texts[i].color    || options.text_color;
      this.ctx.textAlign    = texts[i].align    || "center";
      this.ctx.textBaseline = texts[i].baseline || "top";
      var font_size         = texts[i].size     || options.text_size;
      var font_weight       = texts[i].weight   || "";
      this.ctx.font         = font_weight +" "+ font_size +"px '"+ options.text_font +"' ";
      this.ctx.fillText(texts[i].text , x, y , w);
      y += font_size + (texts[i].margin || 10);
    }
  };



  new LIB().event(w , "load" , function(){new MAIN("#mycanvas")});
})(window,document);