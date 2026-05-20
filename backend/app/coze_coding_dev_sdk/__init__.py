"""
Mock module for coze_coding_dev_sdk
"""
from typing import Any, Dict, List, Optional

class MockResponse:
    content = ""

class LLMClient:
    def __init__(self, *args, **kwargs):
        self.ctx = kwargs.get("ctx")
    
    def invoke(self, *args, **kwargs):
        return MockResponse()
    
    def stream(self, *args, **kwargs):
        return []

class VideoGenerationClient:
    def __init__(self, *args, **kwargs):
        pass

class ImageGenerationClient:
    def __init__(self, *args, **kwargs):
        pass
