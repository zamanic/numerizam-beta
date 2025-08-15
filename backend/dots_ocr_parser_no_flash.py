import os
import sys

# Add the dots.ocr directory to the path
dots_ocr_path = os.path.join(os.path.dirname(__file__), '..', 'dots.ocr')
sys.path.insert(0, dots_ocr_path)

# Monkey patch to disable flash_attn import
sys.modules['flash_attn'] = None

from dots_ocr.parser import DotsOCRParser
import torch
from transformers import AutoModelForCausalLM, AutoProcessor
from qwen_vl_utils import process_vision_info

class DotsOCRParserNoFlash(DotsOCRParser):
    """Modified DotsOCR Parser that doesn't use flash attention"""
    
    def __init__(self, **kwargs):
        # Initialize with the original DotsOCRParser but with flash_attn disabled
        super().__init__(**kwargs)