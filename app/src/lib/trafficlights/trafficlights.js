/**
 * Created by cooperanderson on 12/4/16 AD.
 */

document.write(
	`<div class="titlebar">
		<div class="traffic-light-styles">
			<style>
				.app, .callout-backdrop, .connecting, .titlebar {
					position: absolute;
					top: 0;
					left: 0
				}
				.titlebar {
					-webkit-app-region: drag;
					pointer-events: none;
					height: 25px;
					width: 100%;
					z-index: 3000
				}
				.titlebar button {
					-webkit-app-region: no-drag
				}
				.traffic-lights, .win-buttons {
					position: absolute;
					pointer-events: auto
				}
		
				.traffic-lights {
					top: 6px;
					left: 13px;
					text-align: center;
					cursor: default !important;
				}
		
				.traffic-lights.osx-buttons-notice {
					top: 50px
				}
		
				.traffic-lights button {
					outline:none !important;
					border: none !important;
					width: 12px;
					height: 12px;
					-webkit-border-radius: 6px;
					border-radius: 6px;
					-webkit-background-clip: padding;
					-moz-background-clip: padding;
					background-clip: padding-box;
					background-color: #535559;
					-webkit-transition: background-color .2s;
					-moz-transition: background-color .2s;
					-o-transition: background-color .2s;
					-ms-transition: background-color .2s;
					transition: background-color .2s;
					opacity: .7;
					-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=70)";
					filter: alpha(opacity=70);
					border: 0;
				}
		
				.traffic-lights button:hover {
					opacity: 1;
					-ms-filter: none;
					filter: none;
				}
		
				.traffic-lights button + button {
					margin-left: 4px;
				}
		
				:hover .osx-test1 {
					background-color: #E040FB !important
				}
		
				:hover .osx-test2 {
					background-color: #607D8B !important
				}
			</style>
		</div>
		<div class="traffic-lights"></div>
	</div>`
);

function addTrafficLight(name, color, action) {
	$("div.traffic-light-styles").append(
		`<style>
			:hover .traffic-light-${name} {
				background-color: ${color}/* !important*/;
			}
		</style>
	`);
	$("div.traffic-lights").append(`
		<button class="traffic-light traffic-light-${name}"></button>
	`);
	$(`button.traffic-light-${name}`).on("click", action);
}

const electron = require("electron");

addTrafficLight("close", "#fb615b", function() {
	electron.remote.getCurrentWindow().destroy();
});

addTrafficLight("minimize", "#fdbd41", function() {
	electron.remote.getCurrentWindow().minimize();
});

addTrafficLight("maximize", "#33c749", function() {
	electron.remote.getCurrentWindow().setFullScreen(!electron.remote.getCurrentWindow().isFullScreen());
});