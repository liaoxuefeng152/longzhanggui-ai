"""
发送验证码API（模拟）
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import random

router = APIRouter(prefix="/auth", tags=["认证"])


class SendCodeRequest(BaseModel):
    phone: str = Field(..., description="手机号")


class SendCodeResponse(BaseModel):
    success: bool
    message: str


@router.post("/send-code", response_model=SendCodeResponse)
async def send_verification_code(request: SendCodeRequest):
    """
    发送短信验证码
    
    注意：当前为模拟实现，验证码固定为 123456
    生产环境需要接入真实的短信服务商（阿里云、腾讯云等）
    """
    # 验证手机号格式
    if not request.phone or len(request.phone) != 11:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="手机号格式不正确"
        )
    
    # 模拟发送验证码
    # 生产环境应该：
    # 1. 生成随机验证码
    # 2. 调用短信服务商API发送
    # 3. 将验证码存入Redis（设置过期时间）
    code = "123456"  # 模拟验证码
    
    # 实际发送逻辑示例：
    # code = str(random.randint(100000, 999999))
    # await send_sms(request.phone, code)
    # await redis.setex(f"sms_code:{request.phone}", 300, code)
    
    return SendCodeResponse(
        success=True,
        message=f"验证码已发送到 {request.phone[:3]}****{request.phone[-4:]}"
    )
