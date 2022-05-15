    ## 这是一个Markdown文件

    #### 下面的内容是解析Vue组件的写法

    :::demo
    ```html
    <my-input v-model="msg" placeholder="请输入内容"></my-input>
    <script>
        import {ref, defineComponent} from 'vue'
        export default defineComponent({
            setup() {
                return {
                    msg: ref('')
                }
            }
        })
    </script>
    ```
    :::
