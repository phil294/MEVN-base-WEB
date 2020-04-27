import Vue from 'vue'

### this makes the element become position absolute permanently ###
Vue.directive 'moveable',
	inserted: (target, { value: { parent } }) =>
		if not parent
			el = target
		else
			el = target.parentElement
		target.classList.add 'moveable'
		target.onmousedown = (event) =>
			
			mouse_start_x = event.pageX
			mouse_start_y = event.pageY

			el_start_left = el.offsetLeft
			el_start_top = el.offsetTop

			el.style.position = 'absolute'

			move_to = (mouse_event) =>
				el.style.left = el_start_left + mouse_event.pageX - mouse_start_x + 'px'
				el.style.top = el_start_top + mouse_event.pageY - mouse_start_y + 'px'

			document.addEventListener 'mousemove', move_to
			document.addEventListener 'mouseup', ->
				document.removeEventListener 'mousemove', move_to
				document.removeEventListener 'mouseup', @
			
			target.ondragstart = => false