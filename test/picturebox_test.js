(function($) {
  module('jQuery#picturebox', {
    setup: function() {
      this.picturebox = $('.picture-box').data('pictureBox');
    }
  });

  test('options', function() {
    expect(2);
    strictEqual(this.picturebox.options.animation, 300);
    strictEqual(this.picturebox.options.number, 1);
  });

}(jQuery));
