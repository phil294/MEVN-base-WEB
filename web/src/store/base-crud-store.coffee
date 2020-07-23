import Vue from 'vue'
import axios from 'axios'

### todo docs
###
export default (resource_name, custom, deserializer) =>
	if not deserializer
		deserializer = (r) => r
	resource_name_plural =
		if resource_name.match /y$/
			resource_name.slice(0, -1) + 'ies'
		else
			resource_name + 's'
	
	namespaced: custom.namespaced ? true
	state: -> {
		["#{resource_name_plural}_raw"]: []
		...(custom.state?())
	}
	getters: {
		[resource_name_plural]: (state) ->
			state["#{resource_name_plural}_raw"]
		["#{resource_name}_by_id"]: (state, getters) ->
			getters[resource_name_plural].reduce (all, r) =>
				all[r._id] = r
				all
			, {}
		...custom.getters
	}
	mutations: {
		["add_#{resource_name}_raw"]: (state, r) ->
			state["#{resource_name_plural}_raw"].unshift deserializer r
		["set_#{resource_name_plural}_raw"]: (state, rs) ->
			state["#{resource_name_plural}_raw"] = rs.map (r) => deserializer r
		["update_#{resource_name}_raw"]: (state, r) ->
			index = state["#{resource_name_plural}_raw"].findIndex (t) => t._id == r._id
			Vue.set state["#{resource_name_plural}_raw"], index, deserializer r
		["remove_#{resource_name}_raw"]: (state, r) ->
			index = state["#{resource_name_plural}_raw"].indexOf r
			state["#{resource_name_plural}_raw"].splice index, 1
		["remove_#{resource_name}_raw_by_id"]: (state, _id) ->
			index = state["#{resource_name_plural}_raw"].findIndex (t) => t._id == _id
			state["#{resource_name_plural}_raw"].splice index, 1
		...custom.mutations
	},
	actions: {
		### send to server, upon response commit ###
		["add_#{resource_name}_raw"]: ({ commit }, r) ->
			response = await axios.post resource_name, r
			resource = response.data
			commit "add_#{resource_name}_raw", resource
			resource
		["get_#{resource_name_plural}_raw"]: ({ commit, state }, params) ->
			response = await axios.get resource_name, { params }
			commit "set_#{resource_name_plural}_raw", response.data
			response.data
		["get_#{resource_name}_raw"]: ({ commit }, id) ->
			response = await axios.get "#{resource_name}/#{id}"
			commit "add_#{resource_name}_raw", response.data
			response.data
		["update_#{resource_name}_raw"]: ({ commit }, r) ->
			response = await axios.put "#{resource_name}/#{r._id}", r
			commit "update_#{resource_name}_raw", response.data
			response.data
		["delete_#{resource_name}_raw"]: ({ dispatch }, r) ->
			if not await dispatch 'confirm_ask', "Do you really want to delete '#{r.name}'?", root: true
				return false
			dispatch "delete_#{resource_name}_raw_no_confirm", r
		["delete_#{resource_name}_raw_no_confirm"]: ({ dispatch, commit }, r) ->
			await axios.delete "#{resource_name}/#{r._id}"
			commit "remove_#{resource_name}_raw_by_id", r._id
		...custom.actions
	}