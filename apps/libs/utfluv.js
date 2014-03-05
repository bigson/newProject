/**
 * encode to handle invalid UTF
 *
 * If Chrome tells you "Could not decode a text frame as UTF-8" when you try sending
 * data from nodejs, try using these functions to encode/decode your JSON objects.
 *
 * see discussion here: http://code.google.com/p/v8/issues/detail?id=761#c8
 * see also, for browsers that don't have native JSON: https://github.com/douglascrockford/JSON-js
 *
 * Any time you need to send data between client and server (or vice versa), encode before sending,
 * and decode upon receiving. This is useful, for example, if you are using socket.io for real-time
 * client/server communication of data fetched from a third-party service like Twitter, which might
 * contain Emoji, or other UTF characters outside the BMP.
 */
function strencode( data ) {
  return unescape( encodeURIComponent( JSON.stringify( data ) ) );
}
 
function strdecode( data ) {
  return JSON.parse( decodeURIComponent( escape ( data ) ) );
}