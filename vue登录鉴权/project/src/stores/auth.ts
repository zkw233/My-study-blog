import { LoginApi } from "@/api/auth";
import { defineStore } from "pinia";
import {computed, ref} from "vue"

export const useLoginDataStore = defineStore("LoginData",() =>{

     

    const USERDATA = 'userdata'

    // ----------------state数据区-------------------

    // 关键：初始化时直接从 localStorage 读回来，
    // 解决"刷新页面后 Pinia 内存被清空"的问题  ---> pinia 持久化
    // parse把json字符串转为json对象,saved保存json对象或者空
    const saved = JSON.parse(localStorage.getItem(USERDATA)||sessionStorage.getItem(USERDATA)||'{}')
    const token = ref<string>(saved.token||"")
    const username = ref<string>(saved.username||"")
    const nickname = ref<string>(saved.nickname||"")

    // ----------------getter-------------------

    // 登录状态查询
    // 双重取反，把token的值变成布尔
    const isLoginIn = computed( () => !!token.value)

    // ----------------action--------------------
    // 登录
    async function loginStore(u:string,p:string,r:boolean){
        const res = await LoginApi(u,p)
        // 第一次登录成功后，把后端返回的数据存到state里
        token.value = res.data.token
        username.value = res.data.username
        nickname.value = res.data.nickname

        // 关键：写入前先清两边,因为上一轮可能是勾选了记住登录，本地缓存还有记录(误串台)
        localStorage.removeItem(USERDATA)
        sessionStorage.removeItem(USERDATA)
        // 把整个json的data数据转成json字符串（localstroage仅支持字符串,以USERDATA为键）
        r ?  localStorage.setItem(USERDATA,JSON.stringify(res.data)):sessionStorage.setItem(USERDATA,JSON.stringify(res.data))     
       
    }
    // 退出登录
    function logout() {
        // 清空用户信息
        token.value = ''
        username.value = ''
        nickname.value = ''
        // 移除浏览器本地缓存
        localStorage.removeItem(USERDATA)
        sessionStorage.removeItem(USERDATA)
       
    }

    return {token,username,nickname,loginStore,logout}
})