# 进入生成的文件夹
cd docs/.vuepress/dist

echo 'blog.caffreygo.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:caffreygo/caffreygo.github.io.git master

cd -