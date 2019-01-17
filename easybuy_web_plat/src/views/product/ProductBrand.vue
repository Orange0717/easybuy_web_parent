<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getBrands">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="brands" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="品牌名称" width="190" sortable>
            </el-table-column>
            <el-table-column prop="englishName" label="英文名称" width="190" sortable>
            </el-table-column>
            <!--这个productType是我们在brand这个domain中添加的字段-->
            <el-table-column prop="productType.name" label="商品类型" width="190" sortable>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="250" sortable>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--添加与编辑公用的界面-->
        <el-dialog title="新增/编辑" v-model="formVisible" :close-on-click-modal="false">
            <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
                <el-form-item label="品牌名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="英文名称" prop="englishName">
                    <el-input v-model="form.englishName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="品牌类型" prop="productTypeId">
                    <el-input v-model="form.productTypeId" auto-complete="off"></el-input>
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

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script>
    import util from '../../common/js/util'
    //import NProgress from 'nprogress'
    import {getBrandListPage, removeUser, batchRemoveUser, editUser, addUser} from '../../api/api';

    export default {
        data() {
            return {
                filters: {
                    keyword: ''
                },
                brands: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                fileList2: [],
                formVisible: false,//编辑界面是否显示
                editLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                form: {
                    id: 0,
                    name: '',
                    englishName: '',
                    productTypeId: 0,
                    sortIndex: '',
                    logo: '',
                    description: ''
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
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
            handleCurrentChange(val) {
                this.page = val;
                this.getBrands();
            },
            //获取用户列表
            getBrands() {
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                this.listLoading = true;
                //NProgress.start();
                this.$http.post("/product/brand/json", para)
                    .then((res) => {
                        this.total = res.data.total;
                        this.brands = res.data.rows;
                        this.listLoading = false;
                        //NProgress.done();
                    });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //如果logo的数据不为空，表示分布式文件系统中还有图片，要进行的图片的删除
                    if (row.logo) {
                        this.$http.delete("/common/file/del?filePath=" + row.logo)
                    }
                    //NProgress.start();
                    let para = {id: row.id};
                    //axios进行删除请求
                    this.$http.delete("/product/brand/" + para.id).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getBrands();
                    });
                }).catch(() => {

                });
            },
            //点击修改(编辑)：打开新增修改的dialog，回显数据
            handleEdit: function (index, row) {
                this.formVisible = true;
                //回显普通数据
                this.form = Object.assign({}, row);
                //回显logo图片
                this.fileList2 = [];    //防止取消编辑再次打开会重复显示图片
                if (this.form.logo) {   //如果logo为空，那么表示没有图片，也就不去访问文件系统获取logo图片
                    var logoFile = {
                        url: this.$fileIp + this.form.logo
                    }
                    this.fileList2.push(logoFile)
                }

                //如果要删除，需要将数据库的logo属性交给file.response.resultObj，因为只有上传图片，这个属性才有值
                this.$filePath = this.form.logo
            },
            //点击新增：打开打开新增修改的dialog，设置表单数据（新增没有id）
            handleAdd: function () {
                this.formVisible = true;
                this.form = {
                    name: '',
                    englishName: '',
                    productTypeId: '',
                    sortIndex: '',
                    logo: '',
                    description: ''
                };
            },
            //编辑与新增的提交：通过axios异步发送请求到后台，后台根据有无id进行是修改还是新增的操作
            editSubmit: function () {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.form);
                            //axios发送请求
                            this.$http.post("/product/brand/save", para).then((res) => {
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
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                var filePaths = this.sels.map(item => item.logo);

                //console.log(ids)
                console.log(filePaths)
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    //let para = {ids: ids};
                    //删除图片
                    for (let i = 0; i <filePaths.length ; i++) {
                        let logo = filePaths[i];
                        //logo不为空就进行删除
                        if (logo) {
                            this.$http.delete("/common/file/del?filePath=" + logo);
                        }
                    }

                    this.$http.delete("/product/brand/batchDel?ids="+ids)
                        .then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getBrands();
                    });
                }).catch(() => {

                });
            }
        },
        mounted() {
            this.getBrands();
        }
    }

</script>

<style scoped>

</style>