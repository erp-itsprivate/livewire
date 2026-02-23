frappe.provide("crm");
on_answer_click = function(id,btn) {
    
	 
	let parent = ((btn.parentElement).parentElement).parentElement;

    
	console.log(id);
	console.log(btn);
	console.log( "livewire.utils.action_click");
    frappe.call({
		method: "livewire.utils.action_click",   // dotted path to server method
		args: {
			id: id,
			 
		},
		callback: function(r) {
			console.log(r.message.code);
			 
			if (!r.exc) {
				
				if ( r.message.code.match(/'href':\s*'([^']+)'/)) {
					let new_location=r.message.code.match(/'href':\s*'([^']+)'/)[1];
					console.log("Href found:",new_location );
					window.location.href = new_location;
					 
					 
				} else if ( r.message.code.match(/'result':\s*'([^']+)'/)) {
					console.log("Result found:", r.message.code.match(/'result':\s*'([^']+)'/)[1]);
				}
				if (r.message.can_close==1)
				{
					$(parent).addClass("out");
					setTimeout(() => parent.remove(), 800);
				}
			}
		},
		
	});
    // Call your File B function
     

    // Optional: Hide the alert manually after clicking
    // This finds the button that was clicked (event.target) and removes the alert
     
};
 
const OriginalApplication = frappe.Application;
crm.show_alert = function (message, seconds = 7,allow_close=true,icon,icon_size,live_actions = {}) {
	let indicator_icon_map = {
		orange: "solid-warning",
		yellow: "solid-warning",
		blue: "solid-info",
		green: "solid-success",
		red: "solid-error",
	};

	if (typeof message === "string") {
		message = {
			message: message,
		};
	}
	 
	if (!$("#dialog-container").length) {
		$('<div id="dialog-container"><div id="alert-container"></div></div>').appendTo("body");
	}

	//let icon;
	//if (message.indicator) {
	//	icon = indicator_icon_map[message.indicator.toLowerCase()] || "solid-" + message.indicator;
	//} else {
	//	icon = "solid-info";
	//}
	
	const indicator = message.indicator || "blue";

	let action_section="";
	for (let i = 0; i < live_actions.length; i++) {
		
	 
		let parts = live_actions[i].split("-");
		let   isPrimary = parts[3] == '1'; 	
		let btnClass  = isPrimary ? "btn btn-primary" : "btn btn-secondary";
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
	 
    if (allow_close==true) {
        div.append(`<a class="close">${frappe.utils.icon("close-alt")}</a>`);
		
		div.find(".close").click(function () {
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
		// Delay for animation
		seconds = seconds - 0.8;
	}

	setTimeout(() => {
		div.addClass("out");
		setTimeout(() => div.remove(), 800);
		return false;
	}, seconds * 1000);

	return div;
};
// Override with your own
frappe.Application = class CustomApplication extends OriginalApplication {
    constructor(...args) {
        super(...args);
        console.log("Custom Application constructor called");
		this.show_pending_notifications();
    }
	force_reload()
	{
		frappe.realtime.on('force_reload_from_server', function(data) {
			console.log("Server requested reload.");
			 
			setTimeout(() => {
				window.location.reload();
			}, 1000); 
		});
	}
    // Example: override a method
    show_pending_notifications() {
        console.log("Custom notification logic");
		this.force_reload()
        // call original if needed
        if (super.show_pending_notifications) {
            super.show_pending_notifications();
        }
		


       		frappe.realtime.on("livewire_notification", function(data) {
               console.log(data);
			  
		/*crm.show_alert({
			message: __("Please set {0} first.", [
               data['data2'].bold(),
            ]),
			indicator: "green"  
            
		}, 100,false,'call','lg');*/

        let icon = frappe.utils.icon('phone', 'sm');
		let icon2 = frappe.utils.icon('phone', 'sm');
       /* frappe.show_alert({
				message: `${icon}
                <i class="fa fa-upload"></i> 
								${__("Incoming Call")}
								<br>
								<a
									class="text-small text-muted"
									href="/app/pbx-cdrs/${data['cdr']}">
									${__("View call log")}
                                
								</a>
							`,
			indicator: "green" ,
            
		}, 3);
     */
      /*  frappe.show_alert({
            message: ` <div class="frappe-alert-content" 
            style="display:flex; align-items:center; gap:10px;"> 
            <span style="font-size:14px;">✔ Action completed successfully</span> 
            <button class="btn btn-xs btn-primary alert-btn-ok"> OK </button> 
            <button class="btn btn-xs btn-secondary alert-btn-cancel"> Cancel </button> </div>
                        `,
        indicator: "green" ,
       
    },800);*/
    let btn_id = "btn-answer-" + frappe.utils.get_random(5);
    let safe_caller =data['data2']; 
            // B. Construct the HTML message with the button
            // We use Flexbox for nice alignment
             let message_html = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>
                        Incoming Call: <b>${safe_caller || 'Unknown'}</b>
                    </span>
                    <button id="${btn_id}" class="btn btn-xs btn-secondary"  onclick="on_answer_click('${safe_caller}')">
                        ${frappe.utils.icon('call', 'sm')} Answer
                    </button>
                </div>
            `; 

            // C. Show the Alert
            // We set the second parameter to 15 seconds so the user has time to click
            /*  frappe.show_alert({
                 message: message_html,
               indicator: 'red',
			   subtitle :'Test'
             }, 700); */
			 //let translated_msg = __(data.msg); 
			 
			 crm.show_alert({
				message:  __(data.message),
			  indicator: data.indicator
			}, data.duration,data.allow_close,data.icon,data.icon_size, data.actions			);
            
        });
        
         
 
    }
};
