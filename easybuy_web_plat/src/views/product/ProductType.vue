<template id="productType">
    <el-row style="height: 100%;border: 1px solid rebeccapurple;margin-top: 10px">
        <el-col :span="6" style="border-right: 1px solid rebeccapurple">
            <div class="grid-content bg-purple">
                <el-tree :data="productTypes" :props="defaultProps">

                </el-tree>
            </div>
        </el-col>
        <el-col :span="17" style="margin-left: 10px;padding-top: 10px">
            <div>
                <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
                    <el-form-item label="类型名称" prop="name">
                        <el-input v-model="form.name" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="父类型" prop="pid">
                        <el-input v-model="form.pid" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="排序索引" prop="sortIndex">
                        <el-input v-model="form.sortIndex" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="品牌logo" prop="logo">
                        <el-upload
                                class="upload-demo"
                                action="http://127.0.0.1:9527/services/common/file/upload"
                                :on-preview="handlePreview"
                                :on-remove="handleRemove"
                                :on-success="uploadSuccess"
                                :file-list="fileList2"
                                list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input v-model="form.description" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm">提交</el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>

        </el-col>
    </el-row>
</template>
<style>
    .el-row {
        margin-bottom: 20px;
        height: 100%;
        max-height: 100%;
    }

    :last-child {
        margin-bottom: 0;
    }

    #productType el-col {
        border: 1px solid red;
        border-radius: 4px;
    }

    .grid-content {
        border-radius: 4px;
        min-height: 36px;
    }
</style>

<script>
    export default {
        data() {
            return {
                form: {
                    name: '',
                    pid: '',
                    sortIndex: '',
                    logo: '',
                    description: ''
                },
                formRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                fileList2: [],
                productTypes: [],
                defaultProps: {
                    children: 'children',
                    label: 'name'
                }
            }
        },
        methods: {
            uploadSuccess(response, file, fileList) {
                //上传成功后将文件系统中图片的路径值交给logo
                console.log(response.resultObj)
                this.form.logo = response.resultObj;
            },
            handleRemove(file, fileList) {
                //点击删除，从file中拿到要删除文件在分布式文件系统中的路径(如果是回显删除，那么就只能使用定义的全局常量也就是logo)
                //console.log(file.response.resultObj);回显的时候file.response未定义的属性是未定义判断是新增还是修改操作
                var filePath = file.response ? file.response.resultObj : this.$filePath

                //axios发送请求删除文件
                this.$http.delete("/common/file/del?filePath=" + filePath)
                    .then((res) => {
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        //删除成功将logo置空
                        this.form.logo = "";
                    })
                    .catch(() => {
                        this.$message({
                            message: '删除失败',
                            type: 'error'
                        });
                    });
            },
            handlePreview(file) {
                console.log(file);
            },
            submitForm() {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.form);
                            //axios发送请求
                            this.$http.post("/product/productType/save", para).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['form'].resetFields();
                                this.formVisible = false;
                                this.getBrands();
                            });
                        });
                    }
                });
            },
            resetForm() {
                this.form = {
                    name: '',
                    pid: '',
                    sortIndex: '',
                    logo: '',
                    description: ''
                };
            },
            getTreeData() {
                this.$http.get("/product/productType/treeData")
                    .then(msg => {
                        this.productTypes = msg.data;
                    })
            }
        },
        mounted() {
            this.getTreeData();
        }
    };
</script>