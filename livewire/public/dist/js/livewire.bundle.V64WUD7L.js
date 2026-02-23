(() => {
  // ../livewire/livewire/public/js/livewire_notification.js
  frappe.provide("crm");
  on_answer_click = function(id, btn) {
    let parent = btn.parentElement.parentElement.parentElement;
    console.log(id);
    console.log(btn);
    console.log("livewire.utils.action_click");
    frappe.call({
      method: "livewire.utils.action_click",
      args: {
        id
      },
      callback: function(r) {
        console.log(r.message.code);
        if (!r.exc) {
          if (r.message.code.match(/'href':\s*'([^']+)'/)) {
            let new_location = r.message.code.match(/'href':\s*'([^']+)'/)[1];
            console.log("Href found:", new_location);
            window.location.href = new_location;
          } else if (r.message.code.match(/'result':\s*'([^']+)'/)) {
            console.log("Result found:", r.message.code.match(/'result':\s*'([^']+)'/)[1]);
          }
          if (r.message.can_close == 1) {
            $(parent).addClass("out");
            setTimeout(() => parent.remove(), 800);
          }
        }
      }
    });
  };
  var OriginalApplication = frappe.Application;
  crm.show_alert = function(message, seconds = 7, allow_close = true, icon, icon_size, live_actions = {}) {
    let indicator_icon_map = {
      orange: "solid-warning",
      yellow: "solid-warning",
      blue: "solid-info",
      green: "solid-success",
      red: "solid-error"
    };
    if (typeof message === "string") {
      message = {
        message
      };
    }
    if (!$("#dialog-container").length) {
      $('<div id="dialog-container"><div id="alert-container"></div></div>').appendTo("body");
    }
    const indicator = message.indicator || "blue";
    let action_section = "";
    for (let i = 0; i < live_actions.length; i++) {
      let parts = live_actions[i].split("-");
      let isPrimary = parts[3] == "1";
      let btnClass = isPrimary ? "btn btn-primary" : "btn btn-secondary";
      action_section += `
        <button 
                id="${parts[0]}-${parts[1]}"
                class="${btnClass}" 
				style="${parts[4]}"
                onclick="on_answer_click('${parts[0]}-${parts[1]}',this)">
				${__(parts[2])} 
        </button>`;
    }
    const div = $(`
		<div class="alert desk-alert ${indicator}" role="alert">
			<div class="alert-message-container" >
				<div class="alert-title-container">
					<div>${frappe.utils.icon(icon, icon_size)}</div>
					<div class="alert-message" style="width : 100%;">${message.message}</div>
				</div>
				<div class="alert-subtitle">${message.subtitle || ""}</div>
				<div id=actions style='margin-top: 10px;display:flex;justify-content:space-between;'>
				 
				</div>
			</div>
			<div class="alert-body" style="display: none"></div>
			
		</div>
	`);
    div.find("#actions").append(action_section);
    if (allow_close == true) {
      div.append(`<a class="close">${frappe.utils.icon("close-alt")}</a>`);
      div.find(".close").click(function() {
        div.addClass("out");
        setTimeout(() => div.remove(), 800);
        return false;
      });
    }
    div.hide().appendTo("#alert-container").show();
    if (message.body) {
      div.find(".alert-body").show().html(message.body);
    }
    if (seconds > 2) {
      seconds = seconds - 0.8;
    }
    setTimeout(() => {
      div.addClass("out");
      setTimeout(() => div.remove(), 800);
      return false;
    }, seconds * 1e3);
    return div;
  };
  frappe.Application = class CustomApplication extends OriginalApplication {
    constructor(...args) {
      super(...args);
      console.log("Custom Application constructor called");
      this.show_pending_notifications();
    }
    force_reload() {
      frappe.realtime.on("force_reload_from_server", function(data) {
        console.log("Server requested reload.");
        setTimeout(() => {
          window.location.reload();
        }, 1e3);
      });
    }
    show_pending_notifications() {
      console.log("Custom notification logic");
      this.force_reload();
      if (super.show_pending_notifications) {
        super.show_pending_notifications();
      }
      frappe.realtime.on("livewire_notification", function(data) {
        console.log(data);
        let icon = frappe.utils.icon("phone", "sm");
        let icon2 = frappe.utils.icon("phone", "sm");
        let btn_id = "btn-answer-" + frappe.utils.get_random(5);
        let safe_caller = data["data2"];
        let message_html = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>
                        Incoming Call: <b>${safe_caller || "Unknown"}</b>
                    </span>
                    <button id="${btn_id}" class="btn btn-xs btn-secondary"  onclick="on_answer_click('${safe_caller}')">
                        ${frappe.utils.icon("call", "sm")} Answer
                    </button>
                </div>
            `;
        crm.show_alert({
          message: __(data.message),
          indicator: data.indicator
        }, data.duration, data.allow_close, data.icon, data.icon_size, data.actions);
      });
    }
  };

  // ../livewire/livewire/public/js/socket_keepalive.js
  $(document).ready(function() {
    window.addEventListener("storage", function(event) {
      if (event.key === "frappe_broadcast_reload" && event.newValue) {
        console.log("Reload signal received from another tab.");
        if (cur_frm && cur_frm.is_dirty()) {
          frappe.show_alert({
            message: __("\u26A0\uFE0F Another tab triggered a reload, but you have unsaved changes here. Please save manually."),
            indicator: "orange"
          }, 8);
        } else {
          frappe.show_alert({
            message: __("Syncing with other tabs... reloading."),
            indicator: "blue"
          });
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    });
    const original_clear_cache = frappe.ui.toolbar.clear_cache;
    frappe.ui.toolbar.clear_cache = function() {
      localStorage.setItem("frappe_broadcast_reload", Date.now());
      original_clear_cache();
    };
    console.log("Initializing Socket Keep-Alive mechanism...");
    const CHECK_INTERVAL = 6e5;
    function ensure_connection() {
      if (frappe.session.user === "Guest")
        return;
      if (frappe.realtime && frappe.realtime.socket) {
        if (!frappe.realtime.socket.connected) {
          console.warn("\u26A0\uFE0F Socket disconnected. Forcing reconnection...");
          frappe.realtime.connect();
          if (frappe.realtime.socket.io) {
            frappe.realtime.socket.io.reconnection(true);
            frappe.realtime.socket.open();
          }
        }
      }
    }
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "visible") {
        console.log("Tab active: checking socket health.");
        ensure_connection();
      }
    });
    setInterval(ensure_connection, CHECK_INTERVAL);
    frappe.realtime.on("disconnect", () => {
      console.log("Socket event: disconnected. Scheduling reconnect...");
      setTimeout(ensure_connection, 1e3);
    });
    if (frappe.realtime.socket) {
      frappe.realtime.socket.on("reconnect_error", (error) => {
        console.log("Server unreachable. Waiting...");
      });
    }
  });
})();
//# sourceMappingURL=livewire.bundle.V64WUD7L.js.map
