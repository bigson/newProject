/**
 * Cross Browser helper to addEventListener.
 *
 * @param {HTMLElement} obj The Element to attach event to.
 * @param {string} evt The event that will trigger the binded function.
 * @param {function(event)} fnc The function to bind to the element.
 * @return {boolean} true if it was successfuly binded.
 */
function addEventListener(obj, evt, fnc) {
    // W3C model
    if (obj.addEventListener) {
        obj.addEventListener(evt, fnc, false);
        return true;
    }
    // Microsoft model
    else if (obj.attachEvent) {
        return obj.attachEvent('on' + evt, fnc);
    }
    // Browser don't support W3C or MSFT model, go on with traditional
    else {
        evt = 'on'+evt;
        if(typeof obj[evt] === 'function'){
            // Object already has a function on traditional
            // Let's wrap it with our own function inside another function
            fnc = (function(f1,f2){
                return function(){
                    f1.apply(this,arguments);
                    f2.apply(this,arguments);
                }
            })(obj[evt], fnc);
        }
        obj[evt] = fnc;
        return true;
    }
    return false;
};

// loại bỏ ký tự đặc biệt trong chuỗi khi chat
function validString(mystring){
    return mystring.replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");//.replace(/&/g, "&amp;")
}

// javasript kt có tồn tại class trong element này không
function hasClass( elem, klass ) {
    return (" " + elem.className + " " ).indexOf( " "+klass+" " ) > -1;
}

var tmpl = {};
tmpl.item_listMessage = '\
<li class="<%- @className %>">\
    <div class="u-name"><%- @name%></div>\
    <ul class="u-list-message"><li class="u-message" title="<%- @strTime%>" data-time="<%- @time%>"><%- @message%></li></ul>\
</li>';

tmpl.item_listMessageChild = '<li class="u-message" title="<%- @strTime%>" data-time="<%- @time%>"><%- @message%></li>';

tmpl.item_listUser = '\
<li class="item" data-id="<%- @id %>">\
    <img class="img online" src="/static/img/default-avatar.png" alt="<%- @name%>" title="<%- @name%>" onclick="openUser(event, this)">\
</li>';

tmpl.item_listChat = '\
<tbody id="<%- @customerId %>" class="<%- @_class%>">\
    <tr>\
        <td class="col-rborder td-chat">\
            <div class="wrap-content-chat">\
                <ul class="content-chat">\
                </ul>\
            </div>\
        </td>\
        <td style="height:100%;">\
        </td>\
    </tr>\
    <tr class="row-footer">\
        <td class="col-rborder">\
            <div class="wrap-text-message">\
                <textarea class="text-message" onkeypress="sendMessage(event, this)" data-id="<%- @customerId %>"></textarea>\
            </div>\
            <div class="tip-post">Nhấp Shift + Enter để xuống dòng</div>\
        </td>\
        <td></td>\
    </tr>\
</tbody>';
