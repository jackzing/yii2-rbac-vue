import axios from 'axios'
import {Message, MessageBox} from 'element-ui'
import store from '@/store'

// create an axios instance
const service = axios.create({
	baseURL: process.env.BASE_API, // api 的 base_url
	timeout: 20000 // request timeout
})

// request interceptor
service.interceptors.request.use(
	config => {
		if (store.getters.token) config.headers['X-Token'] = store.getters.token;
		return config;
	},
	error => {
		Promise.reject(error);
	}
)

// response interceptor
service.interceptors.response.use(
	// response => response,
	response => {
		const res = response.data;
		// 1010:非法的token
		if (res.code === 1010) {
			MessageBox.confirm('You have been logged out.', 'Warning', {
				confirmButtonText: 'ReLogin',
				cancelButtonText: 'Cancel',
				type: 'warning'
			}).then(() => {
				store.dispatch('FedLogOut').then(() => {location.reload();})
			})
			return Promise.reject(new Error('Error Token,Please login again.'));
		}

		if (res.code == 1000) return response.data;

		return Promise.reject(new Error(res.data));
	},
	error => {
		console.log('error : ' + error) // for debug
		Message({
			message: 'Server Exception,Please contact the administrator!',
			type: 'error',
			duration: 5 * 1000
		})
		return Promise.reject(error)
	}
)

export default service
