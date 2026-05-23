import tensorflow as tf
import sys

try:
    interpreter = tf.lite.Interpreter(model_path="assets/anigre_model.tflite")
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    print("INPUT DETAILS:")
    for inp in input_details:
        print(f"Name: {inp['name']}")
        print(f"Shape: {inp['shape']}")
        print(f"Type: {inp['dtype']}")
        
    print("\nOUTPUT DETAILS:")
    for out in output_details:
        print(f"Name: {out['name']}")
        print(f"Shape: {out['shape']}")
        print(f"Type: {out['dtype']}")
except Exception as e:
    print(f"Error: {e}")
