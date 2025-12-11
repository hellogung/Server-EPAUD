import JWTHelper from "../helper/jwt"

(async () => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImZ1bGxfbmFtZSI6Ik1pbGxhdGkgSGFuaWZhIFN5YWhpZGFoIiwidXNlcm5hbWUiOiJtaWxsYXRpaHMiLCJyb2xlIjoiZ3VydSJ9LCJleHAiOjE3NjU0NjQ5NTB9.OKQUSyZb9zRhqsX2dAVpb_r2uP1ezj41RjHGfgHdc98"
    JWTHelper.GenerateAccessToken(token)
    
})()