/** Hidden-WebView host that runs Needle 2 (WASM) for ingredient extraction. */
export const NEEDLE_HOST_BASE_URL = 'https://huggingface.co/Cactus-Compute/needle2/resolve/main/';

export const NEEDLE_HOST_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body>
<script src="wasm/needle.js"></script>
<script>
(function () {
  var Module = null;
  var weightsPtr = null;
  var ready = false;

  function send(payload) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }

  function strToWasm(str) {
    var bytes = new TextEncoder().encode(str + String.fromCharCode(0));
    var ptr = Module._malloc(bytes.length);
    Module.HEAPU8.set(bytes, ptr);
    return ptr;
  }

  function readCString(ptr, cap) {
    var end = ptr;
    while (end < ptr + cap && Module.HEAPU8[end] !== 0) end++;
    if (end === ptr) return '';
    return new TextDecoder().decode(Module.HEAPU8.subarray(ptr, end));
  }

  function cachedFetch(url) {
    return fetch(url).then(function (resp) {
      if (!resp.ok) throw new Error('fetch failed ' + resp.status + ' ' + url);
      return resp;
    });
  }

  function completeLine(text) {
    Module._needle_reset();
    var inPtr = strToWasm(text);
    var outCap = 8192;
    var outPtr = Module._malloc(outCap);
    Module.HEAPU8.fill(0, outPtr, outPtr + outCap);
    Module._needle_complete(inPtr, 128, outPtr, outCap);
    Module._free(inPtr);
    var raw = readCString(outPtr, outCap);
    Module._free(outPtr);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      var calls = parsed && parsed.function_calls;
      if (!calls || !calls[0] || !calls[0].arguments) return null;
      return calls[0].arguments;
    } catch (e) {
      return null;
    }
  }

  window.onNeedleCommand = function (cmd) {
    if (!cmd) return;
    if (cmd.type === 'init') {
      var sPtr = strToWasm(cmd.system || '');
      var tPtr = strToWasm(typeof cmd.tools === 'string' ? cmd.tools : JSON.stringify(cmd.tools));
      var ret = Module._needle_init(sPtr, tPtr, 0);
      Module._free(sPtr);
      Module._free(tPtr);
      if (ret < 0) {
        send({ type: 'error', message: 'needle_init ' + ret });
        return;
      }
      ready = true;
      send({ type: 'ready' });
      return;
    }
    if (cmd.type === 'extract') {
      if (!ready) {
        send({ type: 'result', id: cmd.id, items: (cmd.lines || []).map(function () { return null; }) });
        return;
      }
      var items = [];
      var lines = cmd.lines || [];
      for (var i = 0; i < lines.length; i++) {
        try {
          items.push(completeLine(lines[i]));
        } catch (e) {
          items.push(null);
        }
      }
      send({ type: 'result', id: cmd.id, items: items });
    }
  };

  function waitForExport(name) {
    return new Promise(function (resolve, reject) {
      var tries = 0;
      function check() {
        if (Module && Module[name]) return resolve();
        tries += 1;
        if (tries > 200) return reject(new Error('missing ' + name));
        setTimeout(check, 50);
      }
      check();
    });
  }

  async function boot() {
    if (typeof createNeedle !== 'function') {
      throw new Error('createNeedle missing');
    }
    Module = await createNeedle();
    await waitForExport('_needle_load');
    var resp = await cachedFetch('needle2.cact');
    var cactBytes = new Uint8Array(await resp.arrayBuffer());
    weightsPtr = Module._malloc(cactBytes.length);
    Module.HEAPU8.set(cactBytes, weightsPtr);
    var loadRet = Module._needle_load(weightsPtr, BigInt(cactBytes.length));
    if (loadRet !== 0) throw new Error('needle_load ' + loadRet);
    send({ type: 'engine' });
  }

  boot().catch(function (err) {
    send({ type: 'error', message: String(err && err.message ? err.message : err) });
  });
})();
</script>
</body>
</html>
`;
