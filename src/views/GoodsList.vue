<template>
    <div>
      <nav-header></nav-header>
			<!--面包屑-->
      <nav-bread>
        <span>Goods</span>
      </nav-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a href="javascript:void(0)" class="price" v-bind:class="{'sort-up':sortFlag}" @click="sortGoods()">Prices <span v-if="sortFlag">-></span><span v-if="!sortFlag"><-</span></a>
            <a href="javascript:void(0)" class="filterby stopPop" @click.stop="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- price filter -->
            <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a href="javascript:void(0)" @click="setPriceFilter('all')" v-bind:class="{'cur':priceChecked=='all'}">All</a></dd>
                <dd v-for="(item,index) in priceFilter">
                  <a href="javascript:void(0)" @click="setPriceFilter(index)" v-bind:class="{'cur':priceChecked==index}">{{item.startPrice}} - {{item.endPrice}}</a>
                </dd>
              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="item in goodsList">
                    <div class="pic">
                      <a href="#"><img v-lazy="'static/'+item.productImg" alt=""></a>
                      <!--<a href="#"><img :src="'static/'+item.productImg" alt=""></a>-->
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <!--<div class="price">{{item.productPrice | currency('$')}}</div>-->
                      <div class="price">{{item.productPrice | currency('$')}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="view-more-normal"
                   v-infinite-scroll="loadMore"
                   infinite-scroll-disabled="busy"
                   infinite-scroll-distance="20">

                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
      <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
          <p slot="message">
             请先登录,否则无法加入到购物车中!
          </p>
          <div slot="btnGroup">
              <a class="btn btn--m" href="javascript:;" @click="mdShow = false">关闭</a>
          </div>
      </modal>
      <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
        <p slot="message">
          <svg class="icon-status-ok">
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
          </svg>
          <span>加入购物车成!</span>
        </p>
        <div slot="btnGroup">
          <a class="btn btn--m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
          <router-link class="btn btn--m btn--red" href="javascript:;" to="/cart">查看购物车</router-link>
        </div>
      </modal>
      <div class="md-overlay" v-show="overLayFlag" @click.stop="closePop"></div>
      <nav-footer></nav-footer>
    </div>
</template>
<script>
    import NavHeader from './../components/NavHeader'
    import NavFooter from './../components/NavFooter'
    import NavBread from './../components/NavBread'
    import Modal from './../components/Modal'
    import axios from 'axios'
    export default{
        data(){
            return {
                goodsList:[],
                sortFlag:true,///////////////////////////
                page:1,///////////////////////////
                pageSize:8,///////////////////////////
                busy:true,
                loading:false, ////////////
                mdShow:false,
                mdShowCart:false,
                priceFilter:[
                  {
                      startPrice:'0.00',
                      endPrice:'25.00'
                  },
                  {
                    startPrice:'25.00',
                    endPrice:'50.00'
                  },
                  {
                    startPrice:'50.00',
                    endPrice:'75.00'
                  },
                  {
                    startPrice:'75.00',
                    endPrice:'100.00'
                  }
                ],
                priceChecked:'all',
                filterBy:false,
                overLayFlag:false
            }
        },
        mounted(){
            this.getGoodsList();
        },
        components:{
          NavHeader,
          NavFooter,
          NavBread,
          Modal
        },
        methods:{
            getGoodsList(flag){
              let param = {
                page: this.page,
								pageSize: this.pageSize,
                sort: this.sortFlag ? 1: -1,
								priceLevel: this.priceChecked
							};
              this.loading = true;///
              axios.get('/goods/list',{params:param}).then(result => {
                let res = result.data;
                this.loading = false; ////
                if (res.status == '0') { // 如果加载到数据
									if (flag) {
									  this.goodsList = this.goodsList.concat(res.result.list); // 滚动到显示第一页之后，就拼接

										// 判断如果访问的数据数量为0，那就禁用滑动加载
										if (res.result.count < 8) {
										  this.busy = true;
										}else {
										  this.busy = false;
										}
									}else {
                    this.goodsList = res.result.list; // 第一页的时候
										this.busy = false; // 由于一开始busy为true，但是flag默认是false，所以一开始先加载第一页，然后就要开启滑动加载的功能
									}

								}else {
                  this.goodsList = [];
								}
							})
						},
            sortGoods(){   ///////////////////////////
                this.sortFlag = !this.sortFlag;
                this.page = 1;
                this.getGoodsList();/////////////////////////////重新加载一次
            },
            setPriceFilter(index){
              this.priceChecked = index;
              this.page = 1;
              this.getGoodsList();
            },
            loadMore(){
                this.busy = true; // 滚动失效
                setTimeout(() => {
                  this.page++;
                  this.getGoodsList(true);
                }, 500);
            },
            addCart(productId){
                axios.post("/goods/addCart",{
                  productId:productId
                }).then((res)=>{
                    var res = res.data;
                    if(res.status == '0'){
                      alert('加入成功');
//                        this.mdShowCart = true;
//                        this.$store.commit("updateCartCount",1);
                    }else{
//                      alert('加入失败');
                        this.mdShow = true;
                    }
                });
            },
            closeModal(){
              this.mdShow = false;
              this.mdShowCart = false;
            },
            showFilterPop(){
              this.filterBy=true;
              this.overLayFlag=true;
            },
            closePop(){
              this.filterBy=false;
              this.overLayFlag=false;
              this.mdShowCart = false;
            }
        }
    }
</script>
