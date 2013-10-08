/*! Picture Box - v0.1.0 - 2013-10-08
* https://github.com/xixilive/picturebox
* Copyright (c) 2013 xixilive; Licensed MIT */
;(function($){

  "use strict";

  var PictureBox = function(element, options){
    this.$element = element;
    this.$viewport = this.$element.find('.viewport').html('<div class="loading"></div>');
    this.$pictures = this.$element.find('.pictures');
    this.pictures = $.map($('.pictures li', this.$element), function(el){
      return $(el).data();
    });
    this.options = options;
    this.zoomStatus = 'out';
    this.currentIndex = parseInt(this.options.number, 10) || 0;
    this._init();
  };

  PictureBox.DEFAULTS = {
    animation: 200,
    number: 0
  };

  PictureBox.prototype._init = function(){
    var self = this;
    self.moveToCoord = function(e){
      var img = self.image[0],
          size = [self.$viewport.innerWidth(), self.$viewport.innerHeight()],
          offset = self.$viewport.offset(),
          ratio = [img.width / size[0] , img.height / size[1]], 
          ex = e.pageX - offset.left, 
          ey = e.pageY - offset.top;
      return {
        x: Math.min(-1 * ex * ratio[0] + size[0], 0), 
        y: Math.min(-1 * ey * ratio[1] + size[1], 0)
      };
    };

    function centerCoord(){
      var size = [self.$viewport.innerWidth(), self.$viewport.innerHeight()];
      var img = self.image[0];
      return {
        x: (size[0] - img.width)/2,
        y: (size[1] - img.height)/2
      };
    }

    function bgPosition(coord){
      return {'background-position': coord.x.toString()+'px '+coord.y.toString()+'px'};
    }

    self.image = $('<img>')
    .on('load', function(e){
      self.loading = false;
      self.$viewport.find('.loading').stop().fadeOut(self.options.animation);
      var center = centerCoord();
      self.$viewport
        .css('background-image','url('+ e.currentTarget.src +')')
        .css(bgPosition(center));
    })
    .on('error', function(){
      self.loading = false;
      self.$viewport.find('.loading').stop().fadeOut(self.options.animation);
    });

    function onMoving(e){
      if(self.loading){ return; }
      self.$viewport.css(bgPosition(self.moveToCoord(e)));
    }

    this.$pictures.find('li').each(function(){
      $(this).css('background-image', 'url('+$(this).data('thumb')+')')
        .css('background-position', '50% 50%')
        .css('background-repeat', 'no-repeat');
    });

    this.$viewport.on('mousemove.pb', onMoving);
    this.slideTo(this.currentIndex);
  };

  PictureBox.prototype.slideTo = function(n){
    var src = this.pictures[n] && this.pictures[n].src;
    if(src){
      this.loading = true;
      this.$viewport.find('.loading').stop().fadeIn(this.options.animation);
      this.image.attr('src', this.pictures[n].src);
      this.currentIndex = n;
      $('li[data-thumb][data-src]', this.$pictures).removeClass('active');
      $('li[data-thumb][data-src]:eq('+ this.currentIndex +')', this.$pictures).addClass('active');
    }
  };

  PictureBox.prototype.slide = function(id){
    switch(id){
      case 'prev':
        if(this.currentIndex >= 1){
          this.slideTo(this.currentIndex - 1);
        }else{
          this.slideTo(this.pictures.length - 1);
        }
        break;
      case 'next':
        if(this.currentIndex < this.pictures.length - 1){
          this.slideTo(this.currentIndex + 1);
        }else{
          this.slideTo(0);
        }
        break;
      default:
        this.slideTo(parseInt(id, 10) || 0);
        break;
    }
  };

  PictureBox.prototype.zoom = function(){
    if(this.zoomStatus === 'out'){
      this._resizeOverlay(true);
      this.zoomStatus = 'in';
    }else{
      this._resizeOverlay(false);
      this.zoomStatus = 'out';
    }
  };

  PictureBox.prototype._resizeOverlay = function(fullscreen){
    if(fullscreen){
      $('body').css('overflow','hidden');
      this.$element.addClass('zoomin').css({
        width: $(window).innerWidth(),
        height: $(window).innerHeight()
      }).offset({top:$('body').scrollTop(), left:0});
    }else{
      $('body').css('overflow','auto');
      this.$element.css({
        width: 'auto',
        height: 'auto'
      }).removeClass('zoomin');
    }
  };

  var old = $.fn.pictureBox;

  $.fn.pictureBox = function(option){
    return this.each(function(){
      var that = $(this), data = that.data('pictureBox');
      if(!data){
        var options = that.data() || PictureBox.DEFAULTS;
        $.extend(options, typeof option === 'object' && option);
        that.data('pictureBox', (data = new PictureBox(that, options)));
      }
    });
  };

  $.fn.pictureBox.noConflict = function (){
    $.fn.pictureBox = old;
    return this;
  };

  $(document).on('click.picturebox.toolbar', '[data-slide], [data-zoom]', function(e){
    e.preventDefault();
    var self = $(this), data = self.data();
    var target_id = (data.target || self.attr('href') || '').replace('#', '');
    var $target = $('#' + target_id).data('pictureBox');
    if(!$target){
      return;
    }
    if(data.slide){
      $target.slide(data.slide);
      return;
    }
    if(data.zoom){
      $target.zoom();
      return;
    }
  });

  $(document).on('click.picturebox.slide', '.pictures li[data-thumb][data-src]', function(e){
    var el = $(e.currentTarget);
    var $target = el.closest('.picture-box').data('pictureBox');
    if($target){
      $target.slide(el.index());
    }
  });

  $(document).on('keydown.picturebox', function(e){
    var $target = $('.picture-box').data('pictureBox');
    if(!$target){
      return;
    }
    if((e.which === 27 && $target.zoomStatus === 'in') || (e.which === 192 && $target.zoomStatus === 'out')){
      $target.zoom();
    }
    if(e.which === 37 || e.which === 38){
      $target.slide('prev');
    }
    if(e.which === 39 || e.which === 40){
      $target.slide('next');
    }
  });

  $(window).on('resize.picture.zoomin', function(){
    var $target = $('.picture-box.zoomin').data('pictureBox');
    if($target){
      $target._resizeOverlay(true);
    }
  });

  $(function(){
    $('.picture-box').pictureBox();
  });

})(jQuery);
