  <template>
    <div ref="root" class="text-center">
      <NoticeBar left-icon="volume-o" text="在代码阅读过程中人们说脏话的频率是衡量代码质量的唯一标准。" />
      <p class="mg20">This is a root element</p>

      <Button type="primary" @click="beginExercise()" style="margin-right: 10px;">新建方案</Button>
      <Button type="primary" @click="beginExercise()">管理方案</Button>
      <Picker
          title="选择方案"
          :columns="Obj.schemeList"
          :columns-field-names="customFieldName"
          @confirm="onConfirm"
      />

      <div class="flex flex-column">
        <div class="flex flex-center mg-t10">
          <label>当前方案</label>
        </div>
        <div class="flex flex-center mg-t10">
          <label>{{ Obj.scheme.name }}</label>
        </div>
        <div class="flex flex-center mg-t10">
          <label>{{ Obj.scheme.description }}</label>
        </div>
        <div class="flex flex-center mg-t10">
          <label>{{ Obj.scheme.background_music }}</label>
        </div>
      </div>

      <Button type="primary" @click="beginExercise()" style="margin-right: 10px;">执行方案</Button>
      <Button type="primary" @click="speak('语音播报测试')" style="margin-right: 10px;">语音测试</Button>
      <Button type="primary" @click="pauseExercise()">{{pauseStatus?'继续执行':'暂停执行'}}</Button>
      <div>正在运行:{{ Obj.scheme.name }}</div>
      <div>第{{ nowGroup + '/' + Obj.scheme.groupOfTimes }}组</div>
      <div v-if="isRest">正在休息</div>
      <div >{{ countdown - 1 }}</div>

    </div>
  </template>
  
  <script lang="ts" setup>
 
  import { ref, reactive, onMounted } from "vue";
  import { toRaw } from '@vue/reactivity'
  import { Button, NoticeBar, Picker } from "vant";

  import { Scheme } from "./sportTimingPages/scheme"
  import { localSchemeList } from "@/localData/localSchemeList";

  import Speech from  "speak-tts"

  // ref() 函数用来根据给定的值创建一个  响应式的数据对象  ，传入的为 基本数据类型 例如字符串、数字、boolean 等,
  //       返回值是一个对象，这个对象上只包含一个 value 属性,改变值要.value,而且在template中不用写.value
  // reactive() 函数传入的为引用类型但不能代理基本类型值,返回一个  响应式的数据对象 , 想要使用创建的响应式数据也很简单，
  //            创建出来之后，在setup中return出去，直接在template中调用即可。
  // toRefs()  函数可以将 reactive() 创建出来的响应式对象，转换为普通的对象

  const customFieldName = {
      text: 'name',
      value: 'id',
  };
  const root = ref();
  const Obj = reactive({
    scheme: {} as Scheme,
    schemeList:[],
    mapObj:{
      i: 0,
      j: 0,
      k: 0,
    }
  });
  let nowGroup = ref(1) // 组
  let nowFrequency = ref(1)  // 节
  let countdown = ref(1)   // 节拍
  let beater = ref(0)  
  let speech = ref()  
  let pauseStatus = ref(false)
  let isRest = ref(true)   

  onMounted(() => {
    Obj.scheme = JSON.parse(JSON.stringify(localSchemeList[0]))
    Obj.schemeList =JSON.parse(JSON.stringify(localSchemeList)) 
    // setTimeout(()=>{console.log(localSchemeList,Obj.schemeList)},1000)
    speechInit()
  });

  const speechInit = () => {
     speech.value = new Speech();
     speech.value.setLanguage('zh-CN');
     speech.value.init().then(()=>{
        console.log('语音播报初始化完成...')
      })
   }
   const speak = (text:string) => {
     speech.value.speak({text:text}).then(()=>{
      //  console.log("播报完成...")
     })
   }




  const onConfirm = (proxy: object) => {
    console.log(Obj.scheme,toRaw(proxy))
    Obj.scheme = JSON.parse(JSON.stringify(toRaw(proxy)))
  }
  const beginExercise = () => {
    // 重新开始
    if(beater.value) { clearTimeout(beater.value) }
    resetMapObj()
    mainExercise()
  }
  const pauseExercise = () => {
    if(pauseStatus.value == false){
      pauseStatus.value = true
      Obj.mapObj.k--
      countdown.value--
      console.log('暂停执行')
      speak("暂停执行")
    }else{
      pauseStatus.value = false
      console.log('继续执行')
      speak("继续执行")
      const mapObj = Obj.mapObj
      mainExercise(true,mapObj.i,mapObj.j,mapObj.k)
    }
  }
  // 开始锻炼
  const mainExercise = async (keepE = false, i_ = 1,j_ = 1,k_ = 1) => {
    // 暂停需要存储的状态 i_ 当前组,j_ 当前节,k_ 当前拍
    
    
    const mapObj = Obj.mapObj
    keepE == false && speak("开始运动")
    keepE == false && console.log('mapObj:',mapObj);
    ("开始运动")
    // 循环组
    for( mapObj.i=i_;mapObj.i<=Obj.scheme.groupOfTimes;mapObj.i++){
      if(nowGroup.value > Obj.scheme.groupOfTimes ){
        return
      }else{
        
        // 循环每一节 
        for( mapObj.j=j_; mapObj.j<=Obj.scheme.frequency;mapObj.j++){
          
          


          // 每一拍
          console.log(`正在运行第${nowGroup.value }组,第${nowFrequency.value}节`);
          speak(`正在运行第${nowGroup.value }组,第${nowFrequency.value}节`)
          for( mapObj.k=k_; mapObj.k<=Obj.scheme.every_cycle_times;mapObj.k++){
            if(pauseStatus.value == true){
              return
            }

            // 打拍
            // if(countdown.value==14){debugger}
            console.log(nowFrequency.value+'节', countdown.value+'拍',  mapObj.k)
            countdown.value++
            speak(countdown.value.toString())
            await beat(1)

            if(countdown.value == Obj.scheme.every_cycle_times+1){
              // 继续执行时，切频时节拍 k_ 置 1
              nowFrequency.value != 1 && console.log("休息5秒钟，下一节",nowFrequency.value, Obj.scheme.frequency, mapObj.j);
              nowFrequency.value != 1 && speak("休息5秒钟，下一节");
              if(keepE){k_ = 1}
              countdown.value = 1
            }
          }
          nowFrequency.value++
          await rest(0)

          if(nowFrequency.value>Obj.scheme.frequency){
            console.log("休息一会，下一组",nowFrequency.value, Obj.scheme.frequency, mapObj.j);
            nowGroup.value != 1 && speak("休息一会，下一组");
            if(keepE){j_ = 1}
            nowFrequency.value = 1
            // return
          }
          
          
        }
        await rest(Obj.scheme.groupInterval) // 休息间隔
        nowGroup.value++
      }
    }
    console.log('运动结束')
    resetMapObj()
    nowGroup.value = 1
  }

  const resetMapObj = () => {
    Obj.mapObj.i = 1
    Obj.mapObj.j = 1
    Obj.mapObj.k = 1
    countdown.value = 1
    nowFrequency.value = 1
    nowGroup.value = 1
  }

  const rest = async(time:number)=>{
        isRest.value = true
        await sleep(time) // 休息间隔
        isRest.value = false
  }
  const sleep = (time:number)=>{
    return new Promise((resolve) => setTimeout(resolve, time*1000));
  }
  const beat = (time:number)=>{
    return new Promise((resolve) => beater.value = setTimeout(resolve, time*1000));
  }
  </script>