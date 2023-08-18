export default defineAppConfig({
    pages: [
        "pages/home/index", // 首页
        "pages/mall/index", // 商城
        "pages/shoppingCart/index", // 购物车
        "pages/chat/index", // 咨询
        "pages/my/index", // 我的
        "pages/mySetting/index", // 我的设置
        "pages/about/index", // 关于
    ],
    window: {
        backgroundTextStyle: "light",
        navigationBarBackgroundColor: "#fff",
        navigationBarTextStyle: "black",
    },
    tabBar: {
        selectedColor: "#FFC000",
        list: [
            {
                text: "首页",
                pagePath: "pages/home/index",
                iconPath: "assets/images/home.png",
                selectedIconPath: "assets/images/home_selected.png",
            },
            {
                text: "商城",
                pagePath: "pages/mall/index",
                iconPath: "assets/images/mall.png",
                selectedIconPath: "assets/images/mall_selected.png",
            },
            {
                text: "购物车",
                pagePath: "pages/shoppingCart/index",
                iconPath: "assets/images/shoppingCart.png",
                selectedIconPath: "assets/images/shoppingCart__selected.png",
            },
            {
                text: "咨询",
                pagePath: "pages/chat/index",
                iconPath: "assets/images/chat.png",
                selectedIconPath: "assets/images/chat_selected.png",
            },
            {
                text: "我的",
                pagePath: "pages/my/index",
                iconPath: "assets/images/my.png",
                selectedIconPath: "assets/images/my_selected.png",
            },
        ],
    },
    plugins: {
        // chooseLocation: {
        //     version: "1.0.10",
        //     provider: "wx76a9a06e5b4e693e",
        // },
        // routePlan: {
        //     version: "1.0.19",
        //     provider: "wx50b5593e81dd937a",
        // },
    },
    permission: {
        "scope.userInfo": {
            desc: "你的个人信息将用于登录",
        },
        "scope.userLocation": {
            desc: "你的位置信息将用于获取附近门店",
        },
        "scope.userFuzzyLocation": {
            desc: "你的位置信息将用于获取附近门店",
        },
        "scope.address": {
            desc: "你的通讯地址将用于收货",
        },
    },
    requiredPrivateInfos: [
        "chooseLocation",
        "choosePoi",
        "getLocation",
        "chooseAddress",
    ],
    lazyCodeLoading: "requiredComponents",
});
