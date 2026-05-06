(()=>{frappe.provide("crm");on_answer_click=function(o,e){let n=e.parentElement.parentElement.parentElement;console.log(o),console.log(e),console.log("livewire.utils.action_click"),frappe.call({method:"livewire.utils.action_click",args:{id:o},callback:function(i){if(console.log(i.message.code),!i.exc){if(i.message.code.match(/'href':\s*'([^']+)'/)){let l=i.message.code.match(/'href':\s*'([^']+)'/)[1];console.log("Href found:",l),window.location.href=l}else i.message.code.match(/'result':\s*'([^']+)'/)&&console.log("Result found:",i.message.code.match(/'result':\s*'([^']+)'/)[1]);i.message.can_close==1&&($(n).addClass("out"),setTimeout(()=>n.remove(),800))}}})};var u=frappe.Application;crm.show_alert=function(o,e=7,n=!0,i,l,c={}){let d={orange:"solid-warning",yellow:"solid-warning",blue:"solid-info",green:"solid-success",red:"solid-error"};typeof o=="string"&&(o={message:o}),$("#dialog-container").length||$('<div id="dialog-container"><div id="alert-container"></div></div>').appendTo("body");let p=o.indicator||"blue",r="";for(let s=0;s<c.length;s++){let a=c[s].split("-"),f=a[3]=="1"?"btn btn-primary":"btn btn-secondary";r+=`
        <button 
                id="${a[0]}-${a[1]}"
                class="${f}" 
				style="${a[4]}"
                onclick="on_answer_click('${a[0]}-${a[1]}',this)">
				${__(a[2])} 
        </button>`}let t=$(`
		<div class="alert desk-alert ${p}" role="alert">
			<div class="alert-message-container" >
				<div class="alert-title-container">
					<div>${frappe.utils.icon(i,l)}</div>
					<div class="alert-message" style="width : 100%;">${o.message}</div>
				</div>
				<div class="alert-subtitle">${o.subtitle||""}</div>
				<div id=actions style='margin-top: 10px;display:flex;justify-content:space-between;'>
				 
				</div>
			</div>
			<div class="alert-body" style="display: none"></div>
			
		</div>
	`);return t.find("#actions").append(r),n==!0&&(t.append(`<a class="close">${frappe.utils.icon("close-alt")}</a>`),t.find(".close").click(function(){return t.addClass("out"),setTimeout(()=>t.remove(),800),!1})),t.hide().appendTo("#alert-container").show(),o.body&&t.find(".alert-body").show().html(o.body),e>2&&(e=e-.8),setTimeout(()=>(t.addClass("out"),setTimeout(()=>t.remove(),800),!1),e*1e3),t};frappe.Application=class extends u{constructor(...e){super(...e),console.log("Custom Application constructor called"),this.show_pending_notifications()}force_reload(){frappe.realtime.on("force_reload_from_server",function(e){console.log("Server requested reload."),setTimeout(()=>{window.location.reload()},1e3)})}show_pending_notifications(){console.log("Custom notification logic"),this.force_reload(),super.show_pending_notifications&&super.show_pending_notifications(),frappe.realtime.on("livewire_notification",function(e){console.log(e);let n=frappe.utils.icon("phone","sm"),i=frappe.utils.icon("phone","sm"),l="btn-answer-"+frappe.utils.get_random(5),c=e.data2,d=`
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>
                        Incoming Call: <b>${c||"Unknown"}</b>
                    </span>
                    <button id="${l}" class="btn btn-xs btn-secondary"  onclick="on_answer_click('${c}')">
                        ${frappe.utils.icon("call","sm")} Answer
                    </button>
                </div>
            `;crm.show_alert({message:__(e.message),indicator:e.indicator},e.duration,e.allow_close,e.icon,e.icon_size,e.actions)})}};$(document).ready(function(){window.addEventListener("storage",function(i){i.key==="frappe_broadcast_reload"&&i.newValue&&(console.log("Reload signal received from another tab."),cur_frm&&cur_frm.is_dirty()?frappe.show_alert({message:__("\u26A0\uFE0F Another tab triggered a reload, but you have unsaved changes here. Please save manually."),indicator:"orange"},8):(frappe.show_alert({message:__("Syncing with other tabs... reloading."),indicator:"blue"}),setTimeout(()=>{window.location.reload()},500)))});let o=frappe.ui.toolbar.clear_cache;frappe.ui.toolbar.clear_cache=function(){localStorage.setItem("frappe_broadcast_reload",Date.now()),o()},console.log("Initializing Socket Keep-Alive mechanism...");let e=6e5;function n(){frappe.session.user!=="Guest"&&frappe.realtime&&frappe.realtime.socket&&(frappe.realtime.socket.connected||(console.warn("\u26A0\uFE0F Socket disconnected. Forcing reconnection..."),frappe.realtime.connect(),frappe.realtime.socket.io&&(frappe.realtime.socket.io.reconnection(!0),frappe.realtime.socket.open())))}document.addEventListener("visibilitychange",function(){document.visibilityState==="visible"&&(console.log("Tab active: checking socket health."),n())}),setInterval(n,e),frappe.realtime.on("disconnect",()=>{console.log("Socket event: disconnected. Scheduling reconnect..."),setTimeout(n,1e3)}),frappe.realtime.socket&&frappe.realtime.socket.on("reconnect_error",i=>{console.log("Server unreachable. Waiting...")})});})();
//# sourceMappingURL=livewire.bundle.YENMSOUR.js.map
