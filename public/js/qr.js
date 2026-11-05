// QR code generator. Uses the vendored qrcode-generator library (public/js/vendor/qrcode.js).
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.QrTool = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var QUIET_ZONE = 4; // blank modules around the code, required by the QR standard
  var MIN_SCALE = 2; // smaller modules are hard for cameras to read

  // Returns the library's QR object, or throws if the text doesn't fit
  function build(text, level) {
    /* global qrcode */
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']; // so non-English text scans correctly
    var qr = qrcode(0, level); // 0 = pick the smallest version that fits
    qr.addData(text, 'Byte');
    qr.make();
    return qr;
  }

  function draw(canvas, qr, targetSize) {
    var count = qr.getModuleCount();
    var total = count + QUIET_ZONE * 2;
    var scale = Math.max(MIN_SCALE, Math.floor(targetSize / total));

    canvas.width = canvas.height = total * scale;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    for (var row = 0; row < count; row++) {
      for (var col = 0; col < count; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect((col + QUIET_ZONE) * scale, (row + QUIET_ZONE) * scale, scale, scale);
        }
      }
    }
  }

  function mount(doc) {
    var form = doc.getElementById('qrTool');
    if (!form) return;

    var get = function (id) { return doc.getElementById(id); };
    var el = form.elements;
    var labelEl = get('qrLabel');
    var resultEl = get('qrResult');
    var output = get('qrOutput');
    var canvas = get('qrCanvas');
    var download = get('qrDownload');

    function showEmpty(label, result) {
      labelEl.textContent = label;
      resultEl.textContent = result;
      output.hidden = true;
      download.disabled = true;
    }

    function update() {
      var text = el.text.value;
      if (text.trim() === '') return showEmpty('Enter some text or a link', 'No QR code yet');

      var qr;
      try {
        qr = build(text, el.level.value);
      } catch (e) {
        return showEmpty('That text is too long. Shorten it or lower the error correction.', 'Error');
      }

      draw(canvas, qr, Number(el.size.value));
      labelEl.textContent = text.length.toLocaleString('en-US') + ' character' + (text.length === 1 ? '' : 's');
      resultEl.textContent = 'QR code ready';
      output.hidden = false;
      download.disabled = false;
    }

    download.addEventListener('click', function () {
      canvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var link = doc.createElement('a');
        link.href = url;
        link.download = 'qr-code.png';
        link.click();
        setTimeout(function () { URL.revokeObjectURL(url); });
      });
    });

    form.addEventListener('input', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    // The reset event fires before the inputs are cleared
    form.addEventListener('reset', function () { setTimeout(update); });

    update();
  }

  return { build: build, mount: mount };
});
